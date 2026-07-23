package com.codeneptune.caresure

import android.text.InputFilter
import android.util.Log
import android.widget.EditText
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.ViewUtil

class TextInputFilterModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "TextInputFilter"

    override fun getName(): String {
        return "TextInputFilter"
    }

    @ReactMethod
    fun applyDigitsOnly(reactTag: Int, maxLength: Int) {
        Log.d(TAG, "applyDigitsOnly called for tag: $reactTag maxLength: $maxLength")
        attemptApplyFilter(reactTag, maxLength, 0)
    }

    private fun attemptApplyFilter(reactTag: Int, maxLength: Int, attempt: Int) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManagerType = ViewUtil.getUIManagerType(reactTag)
                val uiManager = UIManagerHelper.getUIManager(reactContext, uiManagerType)
                if (uiManager == null) {
                    Log.w(TAG, "UIManager not found for type $uiManagerType, attempt: $attempt")
                    retry(reactTag, maxLength, attempt)
                    return@runOnUiThread
                }

                val view = uiManager.resolveView(reactTag) as? EditText
                if (view != null) {
                    val digitsFilter = InputFilter { source, start, end, dest, dstart, dend ->
                        val digits = StringBuilder(end - start)
                        for (i in start until end) {
                            if (Character.isDigit(source[i])) digits.append(source[i])
                        }
                        // Cap typed input at maxLength so the extra digit never renders.
                        // Multi-char inserts (paste/autofill) skip the cap: JS sanitize
                        // must see the full "+91…" string to strip the country code first.
                        if (maxLength > 0 && end - start <= 1) {
                            val kept = dest.length - (dend - dstart)
                            if (kept + digits.length > maxLength) {
                                return@InputFilter digits.substring(0, maxOf(0, maxLength - kept))
                            }
                        }
                        // null keeps the input untouched (the typing fast path).
                        // Otherwise return just the digits, so pasting "+91 93859 02366"
                        // yields the number instead of being dropped wholesale.
                        if (digits.length == end - start) null else digits.toString()
                    }
                    val currentFilters = view.filters ?: emptyArray()
                    // Filter out any previous TextInputFilter instances to avoid duplicates
                    val filteredList = currentFilters.filter { !it.toString().contains("TextInputFilterModule") }.toTypedArray()
                    view.filters = arrayOf(digitsFilter) + filteredList
                    Log.d(TAG, "Successfully applied digits-only filter to tag: $reactTag")
                } else {
                    Log.w(TAG, "View resolve returned null for tag: $reactTag, attempt: $attempt")
                    retry(reactTag, maxLength, attempt)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception resolving view/applying filter for tag: $reactTag, attempt: $attempt", e)
                retry(reactTag, maxLength, attempt)
            }
        }
    }

    private fun retry(reactTag: Int, maxLength: Int, attempt: Int) {
        if (attempt < 10) {
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                attemptApplyFilter(reactTag, maxLength, attempt + 1)
            }, 50)
        } else {
            Log.e(TAG, "Failed to resolve view for tag $reactTag after 10 attempts")
        }
    }
}
