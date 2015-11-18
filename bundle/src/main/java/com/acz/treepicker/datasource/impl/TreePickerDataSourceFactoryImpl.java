package com.acz.treepicker.datasource.impl;

import com.acz.treepicker.datasource.TreePickerDataSource;
import com.acz.treepicker.datasource.TreePickerDataSourceFactory;
import com.adobe.granite.ui.components.ds.DataSource;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Service;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;

/**
 * Created by anton on 11/11/15.
 */
@Component(
        label = "TreePickerDataSourceFactory",
        description = "Factory to return DataSource based on params",
        metatype = true,
        immediate = false
)
@Service
public class TreePickerDataSourceFactoryImpl implements TreePickerDataSourceFactory {
    @Override
    public DataSource getDataSource(ValueMap properties, ResourceResolver resourceResolver) {
        return new TreePickerDataSource(properties, resourceResolver);
    }
}
