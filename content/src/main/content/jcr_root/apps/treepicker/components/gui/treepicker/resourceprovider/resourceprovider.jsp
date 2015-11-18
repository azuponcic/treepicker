<%@ page import="com.adobe.granite.ui.components.ds.DataSource" %>
<%@ page import="org.apache.commons.lang3.StringUtils" %>
<%@ page import="java.util.*" %>
<%@ page import="org.apache.sling.api.resource.ValueMap" %>
<%@ page import="org.apache.sling.api.wrappers.ValueMapDecorator" %>
<%@ page import="com.acz.treepicker.datasource.TreePickerDataSourceFactory" %>
<%@ page import="com.acz.treepicker.datasource.TreePickerDataSource" %>
<%@include file="/libs/granite/ui/global.jsp" %>
<%
    TreePickerDataSourceFactory dsFactory = sling.getService(TreePickerDataSourceFactory.class);

    ValueMap map = new ValueMapDecorator(new HashMap<String, Object>());

    String path = request.getParameter("path");
    if (StringUtils.isNotBlank(path)) {
        map.put("rootPath", path);
    }

    StringBuffer output = new StringBuffer();
    DataSource ds = dsFactory.getDataSource(map, resourceResolver);
    if (ds != null) {
        output.append(TreePickerDataSource.generateDOMFromDataSource(ds.iterator()));
    }
%>
<%=output.toString() %>