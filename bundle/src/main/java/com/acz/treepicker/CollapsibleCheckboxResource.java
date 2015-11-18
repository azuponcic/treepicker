package com.acz.treepicker;

import com.adobe.granite.ui.components.ds.ValueMapResource;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by Anton.
 */
public class CollapsibleCheckboxResource extends ValueMapResource {

    public static final String RT_COLLAPSIBLE_CHECKBOX = "treepicker/gui/collapsiblecheckbox";
    public static final String NN_SUBLIST = "sublist";

    protected String name;

    public String getJcrPath() {
        return jcrPath;
    }

    protected String jcrPath;
    private static final Logger log = LoggerFactory.getLogger( CollapsibleCheckboxResource.class );

    public CollapsibleCheckboxResource(Resource parent, String name, String path, String jcrPath, Map<String, Object> props){

        super( parent.getResourceResolver() , path , RT_COLLAPSIBLE_CHECKBOX, new ValueMapDecorator(props) );
        this.name = name;
        this.jcrPath = jcrPath;

    }

    @Override
    public Resource getChild (String relPath ) {
        if ( NN_SUBLIST.equals(relPath) ) {

            Map<String, Object> valueMap = new HashMap<>();

            return new CollapsibleSublistResource( this, valueMap );
        } else {
            return super.getChild(relPath);
        }
    }
}
