package expo.modules.inappupdate

import android.app.Activity
import android.util.Log
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val TAG = "InAppUpdate"
// Distinct from PhoneNumberHintModule's 11994.
private const val REQUEST_CODE = 11995
private const val EVENT_STATE = "InAppUpdate:state"

private const val RESULT_ACCEPTED = "accepted"
private const val RESULT_CANCELLED = "cancelled"
private const val RESULT_FAILED = "failed"
private const val RESULT_UNAVAILABLE = "unavailable"
private const val RESULT_IN_PROGRESS = "in_progress"

/**
 * Google Play In-App Updates.
 *
 * Play decides and renders the update UI; this module only asks for FLEXIBLE or
 * IMMEDIATE and reports back. Nothing here draws Google-looking chrome.
 *
 * Every failure path resolves rather than rejects. The flow is unavailable on a
 * sideloaded build, an emulator without Play, or a debug install — all normal
 * during development — and JS must be able to fall back to the store link
 * without a crash or an unhandled rejection.
 */
class InAppUpdateModule : Module() {
    private val appUpdateManager: AppUpdateManager by lazy {
        AppUpdateManagerFactory.create(
            appContext.reactContext ?: throw Exceptions.ReactContextLost(),
        )
    }

    /** Stops a second Play dialog stacking on the first. */
    @Volatile
    private var isFlowInProgress = false

    private var pendingPromise: Promise? = null
    private var listenerRegistered = false

    private val installStateListener = InstallStateUpdatedListener { state ->
        emitState(
            statusName(state.installStatus()),
            state.bytesDownloaded(),
            state.totalBytesToDownload(),
        )
        // A terminal state releases the guard so a later attempt can start.
        when (state.installStatus()) {
            InstallStatus.DOWNLOADED,
            InstallStatus.INSTALLED,
            InstallStatus.FAILED,
            InstallStatus.CANCELED -> isFlowInProgress = false
            else -> Unit
        }
    }

    override fun definition() = ModuleDefinition {
        Name("InAppUpdate")

        Events(EVENT_STATE)

        /**
         * Reports what Play offers for this install. Resolves `available: false`
         * whenever the flow cannot be used, so callers need no error handling.
         */
        AsyncFunction("checkUpdateAvailability") { promise: Promise ->
            try {
                appUpdateManager.appUpdateInfo
                    .addOnSuccessListener { info -> promise.resolve(availabilityPayload(info)) }
                    .addOnFailureListener { e ->
                        // Thrown on sideloaded/debug installs — expected, not an error.
                        Log.w(TAG, "appUpdateInfo unavailable: ${e.message}")
                        promise.resolve(unavailablePayload())
                    }
            } catch (e: Exception) {
                Log.w(TAG, "checkUpdateAvailability failed", e)
                promise.resolve(unavailablePayload())
            }
        }

        /** Download in the background; the user keeps using the app. */
        AsyncFunction("startFlexibleUpdate") { promise: Promise ->
            startUpdate(AppUpdateType.FLEXIBLE, promise)
        }

        /** Play blocks the app until the update completes. */
        AsyncFunction("startImmediateUpdate") { promise: Promise ->
            startUpdate(AppUpdateType.IMMEDIATE, promise)
        }

        /** Installs an already-downloaded flexible update and restarts the app. */
        AsyncFunction("completeFlexibleUpdate") { promise: Promise ->
            try {
                appUpdateManager.completeUpdate()
                promise.resolve(true)
            } catch (e: Exception) {
                Log.e(TAG, "completeUpdate failed", e)
                promise.resolve(false)
            }
        }

        OnActivityResult { _, (requestCode, resultCode, _) ->
            if (requestCode != REQUEST_CODE) return@OnActivityResult
            isFlowInProgress = false
            val promise = pendingPromise ?: return@OnActivityResult
            pendingPromise = null
            promise.resolve(
                when (resultCode) {
                    Activity.RESULT_OK -> RESULT_ACCEPTED
                    Activity.RESULT_CANCELED -> RESULT_CANCELLED
                    else -> RESULT_FAILED
                },
            )
        }
    }

    private fun statusName(status: Int): String = when (status) {
        InstallStatus.PENDING -> "pending"
        InstallStatus.DOWNLOADING -> "downloading"
        InstallStatus.DOWNLOADED -> "downloaded"
        InstallStatus.INSTALLING -> "installing"
        InstallStatus.INSTALLED -> "installed"
        InstallStatus.FAILED -> "failed"
        InstallStatus.CANCELED -> "cancelled"
        else -> "unknown"
    }

    private fun emitState(status: String, downloaded: Long, total: Long) {
        try {
            sendEvent(
                EVENT_STATE,
                mapOf(
                    "status" to status,
                    "bytesDownloaded" to downloaded.toDouble(),
                    "totalBytes" to total.toDouble(),
                ),
            )
        } catch (e: Exception) {
            // No catalyst instance (teardown) — dropping a progress tick is fine.
            Log.w(TAG, "Failed to emit update state", e)
        }
    }

    // Registration stays tied to a flexible update actually starting (see
    // startUpdate below), not to a JS listener merely subscribing — preserves
    // the original timing exactly.
    private fun ensureListener() {
        if (listenerRegistered) return
        appUpdateManager.registerListener(installStateListener)
        listenerRegistered = true
    }

    private fun availabilityPayload(info: AppUpdateInfo): Map<String, Any?> {
        val map = mutableMapOf<String, Any?>(
            "available" to (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE),
            "immediateInProgress" to
                (info.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS),
            "flexibleAllowed" to info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE),
            "immediateAllowed" to info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE),
            "installStatus" to statusName(info.installStatus()),
            "availableVersionCode" to info.availableVersionCode(),
        )
        info.clientVersionStalenessDays()?.let { map["stalenessDays"] = it }
        return map
    }

    private fun unavailablePayload(): Map<String, Any?> = mapOf(
        "available" to false,
        "immediateInProgress" to false,
        "flexibleAllowed" to false,
        "immediateAllowed" to false,
        "installStatus" to "unknown",
    )

    private fun startUpdate(type: Int, promise: Promise) {
        val activity = appContext.currentActivity
        if (activity == null) {
            promise.resolve(RESULT_UNAVAILABLE)
            return
        }
        if (isFlowInProgress) {
            // Play is already on screen; a second launch would stack dialogs.
            promise.resolve(RESULT_IN_PROGRESS)
            return
        }

        try {
            appUpdateManager.appUpdateInfo
                .addOnSuccessListener { info ->
                    val usable =
                        info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE ||
                            info.updateAvailability() ==
                            UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS
                    if (!usable || !info.isUpdateTypeAllowed(type)) {
                        promise.resolve(RESULT_UNAVAILABLE)
                        return@addOnSuccessListener
                    }
                    try {
                        if (type == AppUpdateType.FLEXIBLE) ensureListener()
                        isFlowInProgress = true
                        pendingPromise = promise
                        appUpdateManager.startUpdateFlowForResult(
                            info,
                            type,
                            activity,
                            REQUEST_CODE,
                        )
                    } catch (e: Exception) {
                        Log.e(TAG, "startUpdateFlowForResult failed", e)
                        isFlowInProgress = false
                        pendingPromise = null
                        promise.resolve(RESULT_FAILED)
                    }
                }
                .addOnFailureListener { e ->
                    Log.w(TAG, "startUpdate info failed: ${e.message}")
                    promise.resolve(RESULT_UNAVAILABLE)
                }
        } catch (e: Exception) {
            Log.e(TAG, "startUpdate failed", e)
            promise.resolve(RESULT_UNAVAILABLE)
        }
    }
}
