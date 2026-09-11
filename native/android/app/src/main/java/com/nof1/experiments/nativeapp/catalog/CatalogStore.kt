package com.nof1.experiments.nativeapp.catalog

import android.content.Context
import java.io.IOException

object CatalogStore {
    fun load(context: Context): List<CatalogItem> {
        val source = try {
            context.assets.open("catalog.json").bufferedReader(Charsets.UTF_8).use { it.readText() }
        } catch (error: IOException) {
            throw CatalogLoadException("The bundled catalog could not be read. Reinstall or update the app.", error)
        }
        return CatalogData.parse(source)
    }
}
