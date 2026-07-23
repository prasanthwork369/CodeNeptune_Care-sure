package com.codeneptune.caresure

import android.app.Activity
import android.app.PendingIntent
import android.content.Intent
import android.content.IntentSender
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

// GetPhoneNumberHintIntentRequest lives in credentials-play-services-auth
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity

/**
 * Native module that surfaces the Android "Sign in with" phone number picker.
 *
 * Uses the Google Identity Phone Number Hint API
 * (com.google.android.gms.auth.api.identity) which is part of
 * play-services-auth and requires zero runtime permissions.
 *
 * This is the exact mechanism used by Blinkit, Swiggy, GPay, and PhonePe.
 */
class PhoneNumberHintModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "PhoneNumberHint"
        private const val PHONE_HINT_REQUEST_CODE = 11994
    }

    // Holds the pending promise while we wait for the picker result
    private var pendingPromise: Promise? = null

    private val activityEventListener: ActivityEventListener =
        object : BaseActivityEventListener() {
            override fun onActivityResult(
                activity: Activity,
                requestCode: Int,
                resultCode: Int,
                data: Intent?
            ) {
                if (requestCode != PHONE_HINT_REQUEST_CODE) return

                val promise = pendingPromise ?: return
                pendingPromise = null

                if (resultCode != Activity.RESULT_OK || data == null) {
                    // User dismissed "None of the above" or back-pressed — resolve null, don't reject
                    promise.resolve(null)
                    return
                }

                try {
                    val phoneNumber = Identity.getSignInClient(reactContext)
                        .getPhoneNumberFromIntent(data)
                    Log.d(TAG, "Phone number hint received: $phoneNumber")
                    promise.resolve(phoneNumber)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to extract phone number from Intent", e)
                    promise.resolve(null)
                }
            }
        }

    init {
        reactContext.addActivityEventListener(activityEventListener)
    }

    override fun getName(): String = "PhoneNumberHint"

    /**
     * Launches the native phone number hint picker.
     * Resolves with the selected phone string (e.g. "+919876543210") or null.
     * Never rejects — errors are swallowed and resolved as null to keep the
     * login UX clean (fall back to manual entry).
     */
    @ReactMethod
    fun getPhoneNumberHint(promise: Promise) {
        val activity = reactApplicationContext.currentActivity
        if (activity == null) {
            Log.w(TAG, "No current activity — resolving null")
            promise.resolve(null)
            return
        }

        if (pendingPromise != null) {
            // A picker is already in flight — don't stack a second one
            Log.w(TAG, "Hint already in progress — resolving null")
            promise.resolve(null)
            return
        }

        pendingPromise = promise

        try {
            val request = GetPhoneNumberHintIntentRequest.builder().build()
            Identity.getSignInClient(activity)
                .getPhoneNumberHintIntent(request)
                .addOnSuccessListener { pendingIntent ->
                    try {
                        activity.startIntentSenderForResult(
                            pendingIntent.intentSender,
                            PHONE_HINT_REQUEST_CODE,
                            /* fillInIntent= */ null,
                            /* flagsMask= */ 0,
                            /* flagsValues= */ 0,
                            /* extraFlags= */ 0
                        )
                    } catch (e: IntentSender.SendIntentException) {
                        Log.e(TAG, "Failed to launch phone hint picker", e)
                        pendingPromise?.resolve(null)
                        pendingPromise = null
                    }
                }
                .addOnFailureListener { e ->
                    Log.e(TAG, "getPhoneNumberHintIntent failed", e)
                    pendingPromise?.resolve(null)
                    pendingPromise = null
                }
        } catch (e: Exception) {
            Log.e(TAG, "Unexpected error launching phone hint", e)
            pendingPromise?.resolve(null)
            pendingPromise = null
        }
    }

    override fun invalidate() {
        // Clean up listener and pending promise when the module is torn down
        pendingPromise?.resolve(null)
        pendingPromise = null
        reactContext.removeActivityEventListener(activityEventListener)
        super.invalidate()
    }
}
