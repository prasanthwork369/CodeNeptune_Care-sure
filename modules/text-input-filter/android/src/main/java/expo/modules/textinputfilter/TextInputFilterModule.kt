package expo.modules.textinputfilter

import android.text.InputFilter
import android.util.Log
import android.widget.EditText
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.ViewUtil
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val TAG = "TextInputFilter"
private const val MODE_DIGITS = 0
private const val MODE_ASCII = 1
private const val EVENT_LIMIT_REACHED = "TextInputFilter:limitReached"

class TextInputFilterModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TextInputFilter")

        Events(EVENT_LIMIT_REACHED)

        Function("applyDigitsOnly") { reactTag: Int, maxLength: Int ->
            attemptApplyFilter(reactTag, maxLength, 0, MODE_DIGITS)
        }

        // English-only input. Native-level rejection avoids controlled-input desyncs.
        Function("applyAsciiOnly") { reactTag: Int ->
            attemptApplyFilter(reactTag, 0, 0, MODE_ASCII)
        }
    }

    // Best-effort UI signal only — a dropped event just means one missed toast.
    private fun emitLimitReached() {
        try {
            sendEvent(EVENT_LIMIT_REACHED)
        } catch (e: Exception) {
            Log.w(TAG, "Failed to emit limit-reached event", e)
        }
    }

    // ReactContext cast for UIManagerHelper
    private val reactContext: ReactContext
        get() = appContext.reactContext as? ReactContext ?: throw Exceptions.ReactContextLost()

    private fun buildAsciiFilter(): InputFilter {
        return InputFilter { source, start, end, _, _, _ ->
            val kept = StringBuilder(end - start)
            for (i in start until end) {
                val c = source[i]
                if (c.code in 0x20..0x7E || c == '\n' || c == '\t') kept.append(c)
            }
            // null keeps input untouched
            if (kept.length == end - start) null else kept.toString()
        }
    }

    private fun attemptApplyFilter(reactTag: Int, maxLength: Int, attempt: Int, mode: Int) {
        UiThreadUtil.runOnUiThread {
            try {
                val uiManagerType = ViewUtil.getUIManagerType(reactTag)
                val uiManager = UIManagerHelper.getUIManager(reactContext, uiManagerType)
                if (uiManager == null) {
                    Log.w(TAG, "UIManager not found for type $uiManagerType, attempt: $attempt")
                    retry(reactTag, maxLength, attempt, mode)
                    return@runOnUiThread
                }

                val view = uiManager.resolveView(reactTag) as? EditText
                if (view != null) {
                    val digitsFilter = if (mode == MODE_ASCII) buildAsciiFilter() else InputFilter { source, start, end, dest, dstart, dend ->
                        val digits = StringBuilder(end - start)
                        for (i in start until end) {
                            if (Character.isDigit(source[i])) digits.append(source[i])
                        }
                        // Cap single typed digits at maxLength. Pasted text skips this to allow country-code stripping.
                        if (maxLength > 0 && end - start <= 1) {
                            val kept = dest.length - (dend - dstart)
                            if (kept + digits.length > maxLength) {
                                if (digits.isNotEmpty()) emitLimitReached()
                                return@InputFilter digits.substring(0, maxOf(0, maxLength - kept))
                            }
                        }
                        // null keeps input untouched; copy-paste extracts digits only
                        if (digits.length == end - start) null else digits.toString()
                    }
                    val currentFilters = view.filters ?: emptyArray()
                    // Filter out any previous TextInputFilterModule instances to avoid duplicates
                    val filteredList = currentFilters.filter { !it.toString().contains("TextInputFilterModule") }.toTypedArray()
                    view.filters = arrayOf(digitsFilter) + filteredList
                    Log.d(TAG, "Successfully applied filter (mode=$mode) to tag: $reactTag")
                } else {
                    Log.w(TAG, "View resolve returned null for tag: $reactTag, attempt: $attempt")
                    retry(reactTag, maxLength, attempt, mode)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception resolving view/applying filter for tag: $reactTag, attempt: $attempt", e)
                retry(reactTag, maxLength, attempt, mode)
            }
        }
    }

    private fun retry(reactTag: Int, maxLength: Int, attempt: Int, mode: Int) {
        if (attempt < 10) {
            android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                attemptApplyFilter(reactTag, maxLength, attempt + 1, mode)
            }, 50)
        } else {
            Log.e(TAG, "Failed to resolve view for tag $reactTag after 10 attempts")
        }
    }
}
