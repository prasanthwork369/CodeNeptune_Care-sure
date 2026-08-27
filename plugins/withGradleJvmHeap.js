const { withGradleProperties } = require("expo/config-plugins");

const JVM_ARGS_KEY = "org.gradle.jvmargs";
// R8 and zipflinger OOM'd at default heap sizes on our dependency graph. 6144m fixes it.
const JVM_ARGS_VALUE =
  "-Xmx6144m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError";

/** Raises Gradle daemon's JVM heap size in gradle.properties to prevent OOM errors during R8 minification. */
module.exports = function withGradleJvmHeap(config) {
  return withGradleProperties(config, (cfg) => {
    const existing = cfg.modResults.find(
      (item) => item.type === "property" && item.key === JVM_ARGS_KEY,
    );
    if (existing) {
      existing.value = JVM_ARGS_VALUE;
    } else {
      cfg.modResults.push({
        type: "property",
        key: JVM_ARGS_KEY,
        value: JVM_ARGS_VALUE,
      });
    }

    // Ensure Kotlin compiler compiles in-process to avoid daemon classloader NoClassDefFoundError
    const kotlinStrategyKey = "kotlin.compiler.execution.strategy";
    const existingStrategy = cfg.modResults.find(
      (item) => item.type === "property" && item.key === kotlinStrategyKey,
    );
    if (existingStrategy) {
      existingStrategy.value = "in-process";
    } else {
      cfg.modResults.push({
        type: "property",
        key: kotlinStrategyKey,
        value: "in-process",
      });
    }
    return cfg;
  });
};
