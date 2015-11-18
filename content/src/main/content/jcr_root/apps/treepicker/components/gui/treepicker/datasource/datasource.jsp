<%@ page import="com.adobe.cq.commerce.common.ValueMapDecorator" %>
<%@ page import="com.adobe.granite.ui.components.ds.DataSource" %>
<%@ page import="org.apache.sling.api.resource.ValueMap" %>
<%@ page import="java.util.HashMap" %>
<%@ page import="com.acz.treepicker.datasource.TreePickerDataSourceFactory" %>
<%@include file="/libs/granite/ui/global.jsp" %>
<%
    ValueMap listProperties = resource.getValueMap();
    ValueMap map = new ValueMapDecorator(new HashMap<String, Object>());
    String rootPath = listProperties.get("rootPath", String.class);
    if (rootPath != null) {
        map.put("rootPath", rootPath);
    }

    TreePickerDataSourceFactory dsFactory = sling.getService(TreePickerDataSourceFactory.class);
    if (dsFactory != null) {
        DataSource ds = dsFactory.getDataSource(map, resourceResolver);
        request.setAttribute(DataSource.class.getName(), ds);
    }
%>