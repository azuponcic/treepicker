package com.acz.treepicker.datasource;

import com.acz.treepicker.CollapsibleCheckboxResource;
import com.adobe.granite.ui.components.ds.DataSource;
import com.day.cq.wcm.api.NameConstants;
import com.day.cq.wcm.api.Page;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceResolver;
import org.apache.sling.api.resource.ValueMap;

import java.util.*;

/**
 * Created by a on 11/14/2015.
 */
public class TreePickerDataSource implements DataSource {
    ValueMap properties;
    ResourceResolver resourceResolver;
    Resource resource;


    public TreePickerDataSource(ValueMap properties, ResourceResolver resourceResolver) {
        this.properties = properties;
        this.resourceResolver = resourceResolver;
        init();
    }

    @Override
    public Iterator<Resource> iterator() {
        List<Resource> resources = getResources();
        return resources.iterator();
    }

    private void init() {
        if (properties == null) {
            return;
        }

        if (resourceResolver == null) {
            return;
        }

        String rootPath = properties.get("rootPath", String.class);
        if (rootPath != null) {
            resource = resourceResolver.getResource(rootPath);
        }
    }

    private List<Resource> getResources() {
        List<Resource> checkBoxList = buildCheckboxList();

        Collections.sort(checkBoxList, new Comparator<Resource>() {
            @Override
            public int compare(Resource r1, Resource r2) {
                return (r1.getName().compareTo(r2.getName()));
            }
        });

        return checkBoxList;
    }

    private List<Resource> buildCheckboxList(){
        List<Resource> checkboxList = new LinkedList<>();

        if (resource == null) {
            return checkboxList;
        }

        Iterator<Resource> resourceIterator = resource.listChildren();
        if (resourceIterator == null) {
            return checkboxList;
        }

        while( resourceIterator.hasNext() ){
            Resource childResource = resourceIterator.next();

            if ( childResource.getResourceType().equalsIgnoreCase(NameConstants.NT_PAGE) ) {
                Page page = childResource.adaptTo(Page.class);
                if (page != null) {
                    String name = page.getName();
                    String path = page.getPath();
                    String jcrPath = page.getPath();
                    Iterator<Resource> children = childResource.listChildren();
                    boolean hasChildren = children.hasNext();

                    Map<String, Object> valueMap = new HashMap<>();

                    valueMap.put("text", page.getTitle());
                    valueMap.put("value", jcrPath);
                    valueMap.put("checked", false);
                    valueMap.put("name", "./ko:" + name);
                    valueMap.put("hasChildren", hasChildren);

                    Resource checkboxResource = new CollapsibleCheckboxResource(resource, name, path, jcrPath, valueMap);
                    checkboxList.add(checkboxResource);
                }
            }
        }

        return checkboxList;
    }

    public static String generateDOMFromDataSource(Iterator<Resource> dsIt) {

        StringBuilder output = new StringBuilder();
        output.append("<ul class=\"foundation-nestedcheckboxlist\" data-foundation-nestedcheckboxlist-disconnected=\"false\">");
        while (dsIt.hasNext()) {
            Resource res = dsIt.next();
            ValueMap valueMap = res.getValueMap();

            output.append("<li class=\"foundation-nestedcheckboxlist-item\">");
            output.append("<div class=\"coral-Form-fieldwrapper coral-Form-fieldwrapper--singleline\">\n");
            output.append("<span class=\"collapse-control ");
            boolean hasChildren = valueMap.get("hasChildren", false);
            if (!hasChildren) {
                output.append ("no-children");
            } else {
                output.append(" closed");
            }
            output.append("\"></span>\n");
            output.append("<label class=\"coral-Checkbox coral-Form-field\">\n");
            output.append("<input type=\"checkbox\" name=\"" + valueMap.get("name", "") + "\" value=\"" + valueMap.get("value", "") + "\" class=\"coral-Checkbox-input\" " + (valueMap.get("disabled", false) ? "disabled=\"disabled\"" : "") + ">\n");
            output.append("<span class=\"coral-Checkbox-checkmark\"></span>\n");
            output.append("<span class=\"coral-Checkbox-description\">" + valueMap.get("text", "") + "</span>\n");
            output.append("<input type=\"hidden\" name=\"" + valueMap.get("name", "") + "@Delete\">\n");
            output.append("</label>\n");
            output.append("</div>");
            output.append("<ul class=\"foundation-nestedcheckboxlist\" data-foundation-nestedcheckboxlist-disconnected=\"false\"></ul>\n");
            output.append("</li>");
        }
        output.append("</ul>");
        return output.toString();
    }
}
