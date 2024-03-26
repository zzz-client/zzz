var jsonData = pm.response.json();
var id = jsonData.id.split('/');
pm.environment.set("_accessToken", jsonData.access_token);
pm.environment.set("_endpoint", jsonData.instance_url);
pm.environment.set("_userId", id.pop());
pm.environment.set("_orgId", id.pop());