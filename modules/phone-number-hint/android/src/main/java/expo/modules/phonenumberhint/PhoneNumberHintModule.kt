package expo.modules.phonenumberhint

import android.app.Activity
import android.content.IntentSender
import android.util.Log
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val TAG = "PhoneNumberHint"
private const val PHONE_HINT_REQUEST_CODE = 11994

/** Native module surfacing the Android Google Play Services Phone Number Hint picker (requires zero runtime permissions). */
class PhoneNumberHintModule : Module() {
    // Active pending promise for picker result
    private var pendingPromise: Promise? = null

    override fun definition() = ModuleDefinition {
        Name("PhoneNumberHint")

        /** Launches the phone hint picker, resolving with the phone number string or null. */
        AsyncFunction("getPhoneNumberHint") { promise: Promise ->
            val activity = appContext.currentActivity
            if (activity == null) {
                Log.w(TAG, "No current activity — resolving null")
                promise.resolve(null)
                return@AsyncFunction
            }

            if (pendingPromise != null) {
                // Prevent stacking multiple picker requests
                Log.w(TAG, "Hint already in progress — resolving null")
                promise.resolve(null)
                return@AsyncFunction
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
                                /* extraFlags= */ 0,
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

        OnActivityResult { activity, (requestCode, resultCode, data) ->
            if (requestCode != PHONE_HINT_REQUEST_CODE) return@OnActivityResult

            val promise = pendingPromise ?: return@OnActivityResult
            pendingPromise = null

            if (resultCode != Activity.RESULT_OK || data == null) {
                // Resolve null on dismissal/cancellation
                promise.resolve(null)
                return@OnActivityResult
            }

            try {
                val phoneNumber = Identity.getSignInClient(activity).getPhoneNumberFromIntent(data)
                Log.d(TAG, "Phone number hint received: $phoneNumber")
                promise.resolve(phoneNumber)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to extract phone number from Intent", e)
                promise.resolve(null)
            }
        }
    }
}
