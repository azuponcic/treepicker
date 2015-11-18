package com.acz.treepicker.datasource;

import com.adobe.granite.ui.components.ds.ValueMapResource;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.wrappers.ValueMapDecorator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

/**
 * Created by Anton.
 */
public class CollapsibleSublistResource extends ValueMapResource {
    public static final String RT_NESTED_CHECKBOX_LIST = "granite/ui/components/foundation/form/nestedcheckboxlist";
    public static final String NN_SUBLIST = "sublist";
    public static final String NN_ITEMS = "items";

    protected CollapsibleCheckboxResource parent;
    private static final Logger log = LoggerFactory.getLogger( CollapsibleSublistResource.class );

    public CollapsibleSublistResource(CollapsibleCheckboxResource parent, Map<String, Object> valueMap) {
        super( parent.getResourceResolver(), parent.getPath() + "/" + NN_SUBLIST, RT_NESTED_CHECKBOX_LIST,
                new ValueMapDecorator( valueMap ) );
        this.parent = parent;
    }

    @Override
    public Resource getChild(String relPath) {
        if (NN_ITEMS.equals(relPath)) {
            return new CollapsibleItemsResource(this);
        } else {
            return super.getChild(relPath);
        }
    }

    @Override
    public Resource getParent() {
        return parent;
    }

}
