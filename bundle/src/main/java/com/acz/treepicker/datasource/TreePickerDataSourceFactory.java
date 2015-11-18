package com.acz.treepicker.datasource;

import com.adobe.granite.ui.components.ds.DataSource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;

/**
 * Created by anton on 11/11/15.
 */
public interface TreePickerDataSourceFactory {
    public DataSource getDataSource(ValueMap properties, ResourceResolver resourceResolver);
}
