import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

val nativeProperties = Properties().apply {
    rootProject.file("native.properties").takeIf { it.isFile }?.inputStream()?.use(::load)
}
fun setting(name: String): String = providers.environmentVariable(name).orNull
    ?: nativeProperties.getProperty(name, "")
fun quoted(value: String): String = "\"" + value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "") + "\""

android {
    namespace = "com.nof1.experiments.nativeapp"
    compileSdk = 37
    defaultConfig {
        applicationId = "com.nof1.experiments.nativeapp"
        minSdk = 28
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0-native"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        buildConfigField("String", "CLERK_PUBLISHABLE_KEY", quoted(setting("NOF1_CLERK_PUBLISHABLE_KEY")))
        buildConfigField("String", "CONVEX_URL", quoted(setting("NOF1_CONVEX_URL")))
        buildConfigField("boolean", "ENABLE_ACCOUNT_DELETION", (setting("NOF1_ENABLE_ACCOUNT_DELETION") == "true").toString())
    }
    flavorDimensions += "backend"
    productFlavors {
        create("cloud") {
            dimension = "backend"
            buildConfigField("boolean", "LOCAL_DEMO", "false")
            resValue("string", "app_name", "Nof1 Native")
        }
        create("localDemo") {
            dimension = "backend"
            applicationIdSuffix = ".local"
            versionNameSuffix = "-local-development"
            buildConfigField("boolean", "LOCAL_DEMO", "true")
            resValue("string", "app_name", "Nof1 Local Dev")
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
    sourceSets["main"].assets.directories.add("../../shared")
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    buildFeatures {
        compose = true
        buildConfig = true
        resValues = true
    }
    testOptions.unitTests.isIncludeAndroidResources = true
    lint {
        abortOnError = true
        checkReleaseBuilds = true
    }
}
kotlin { jvmToolchain(17) }

dependencies {
    implementation("com.clerk:clerk-android-api:1.1.3")
    implementation("com.clerk:clerk-android-ui:1.1.3")
    implementation("dev.convex:android-convexmobile:0.8.0@aar") { isTransitive = true }
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.11.0")
    val composeBom = platform("androidx.compose:compose-bom:2026.08.00")
    implementation(composeBom)
    androidTestImplementation(composeBom)
    implementation("androidx.activity:activity-compose:1.13.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.11.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.11.0")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.foundation:foundation")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.11.0")
    testImplementation("org.robolectric:robolectric:4.16.1")
    testImplementation("androidx.compose.ui:ui-test-junit4")
    androidTestImplementation("androidx.test.ext:junit:1.3.0")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
