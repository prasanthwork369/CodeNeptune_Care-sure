package com.codeneptune.caresure.inappupdate

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * ReactPackage that exposes [InAppUpdateModule] to the React Native bridge.
 * Registered in MainApplication by plugins/withCustomNativeFiles.js.
 */
class InAppUpdatePackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(InAppUpdateModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
