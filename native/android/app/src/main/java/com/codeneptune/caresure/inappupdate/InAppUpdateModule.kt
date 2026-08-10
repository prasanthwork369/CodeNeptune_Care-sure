package com.codeneptune.caresure.inappupdate

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability

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
class InAppUpdateModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "InAppUpdate"
        // Distinct from PhoneNumberHintModule's 11994.
        private const val REQUEST_CODE = 11995
        private const val EVENT_STATE = "InAppUpdate:state"

        private const val RESULT_ACCEPTED = "accepted"
        private const val RESULT_CANCELLED = "cancelled"
        private const val RESULT_FAILED = "failed"
        private const val RESULT_UNAVAILABLE = "unavailable"
        private const val RESULT_IN_PROGRESS = "in_progress"
    }

    private val appUpdateManager: AppUpdateManager by lazy {
        AppUpdateManagerFactory.create(reactContext)
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

    private val activityEventListener: ActivityEventListener =
        object : BaseActivityEventListener() {
            override fun onActivityResult(
                activity: Activity,
                requestCode: Int,
                resultCode: Int,
                data: Intent?
            ) {
                if (requestCode != REQUEST_CODE) return
                isFlowInProgress = false
                val promise = pendingPromise ?: return
                pendingPromise = null
                promise.resolve(
                    when (resultCode) {
                        Activity.RESULT_OK -> RESULT_ACCEPTED
                        Activity.RESULT_CANCELED -> RESULT_CANCELLED
                        else -> RESULT_FAILED
                    }
                )
            }
        }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "InAppUpdate"

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
            val payload = Arguments.createMap().apply {
                putString("status", status)
                putDouble("bytesDownloaded", downloaded.toDouble())
                putDouble("totalBytes", total.toDouble())
            }
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(EVENT_STATE, payload)
        } catch (e: Exception) {
            // No catalyst instance (teardown) — dropping a progress tick is fine.
            Log.w(TAG, "Failed to emit update state", e)
        }
    }

    private fun ensureListener() {
        if (listenerRegistered) return
        appUpdateManager.registerListener(installStateListener)
        listenerRegistered = true
    }

    /**
     * Reports what Play offers for this install. Resolves `available: false`
     * whenever the flow cannot be used, so callers need no error handling.
     */
    @ReactMethod
    fun checkUpdateAvailability(promise: Promise) {
        try {
            appUpdateManager.appUpdateInfo
                .addOnSuccessListener { info ->
                    val map: WritableMap = Arguments.createMap().apply {
                        val updateAvailable =
                            info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                        putBoolean("available", updateAvailable)
                        putBoolean(
                            "immediateInProgress",
                            info.updateAvailability() ==
                                UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS,
                        )
                        putBoolean(
                            "flexibleAllowed",
                            info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE),
                        )
                        putBoolean(
                            "immediateAllowed",
                            info.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE),
                        )
                        putString("installStatus", statusName(info.installStatus()))
                        info.clientVersionStalenessDays()?.let {
                            putInt("stalenessDays", it)
                        }
                        putInt("availableVersionCode", info.availableVersionCode())
                    }
                    promise.resolve(map)
                }
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

    private fun unavailablePayload(): WritableMap = Arguments.createMap().apply {
        putBoolean("available", false)
        putBoolean("immediateInProgress", false)
        putBoolean("flexibleAllowed", false)
        putBoolean("immediateAllowed", false)
        putString("installStatus", "unknown")
    }

    private fun startUpdate(type: Int, promise: Promise) {
        val activity = reactApplicationContext.currentActivity
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

    /** Download in the background; the user keeps using the app. */
    @ReactMethod
    fun startFlexibleUpdate(promise: Promise) = startUpdate(AppUpdateType.FLEXIBLE, promise)

    /** Play blocks the app until the update completes. */
    @ReactMethod
    fun startImmediateUpdate(promise: Promise) = startUpdate(AppUpdateType.IMMEDIATE, promise)

    /** Installs an already-downloaded flexible update and restarts the app. */
    @ReactMethod
    fun completeFlexibleUpdate(promise: Promise) {
        try {
            appUpdateManager.completeUpdate()
            promise.resolve(true)
        } catch (e: Exception) {
            Log.e(TAG, "completeUpdate failed", e)
            promise.resolve(false)
        }
    }

    // Required by NativeEventEmitter; the listener itself lives on the JS side.
    @ReactMethod
    fun addListener(eventName: String) = Unit

    @ReactMethod
    fun removeListeners(count: Int) = Unit

    override fun invalidate() {
        if (listenerRegistered) {
            try {
                appUpdateManager.unregisterListener(installStateListener)
            } catch (e: Exception) {
                Log.w(TAG, "unregisterListener failed", e)
            }
            listenerRegistered = false
        }
        pendingPromise = null
        isFlowInProgress = false
        reactContext.removeActivityEventListener(activityEventListener)
        super.invalidate()
    }
}
