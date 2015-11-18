package com.acz.treepicker;

import com.day.cq.commons.jcr.JcrConstants;
import org.apache.sling.api.resource.SyntheticResource;

/**
 * Created by kmall.
 */
public class CollapsibleItemsResource extends SyntheticResource {
    public static final String NN_ITEMS = "items";

    private CollapsibleSublistResource parent;

    public CollapsibleItemsResource(CollapsibleSublistResource parent) {
        super(parent.getResourceResolver(), parent.getPath() + "/" + NN_ITEMS, JcrConstants.NT_UNSTRUCTURED);
        this.parent = parent;
    }

    public CollapsibleCheckboxResource getParentCheckbox() {
        return parent.parent;
    }

}
