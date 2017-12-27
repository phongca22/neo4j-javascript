angular.module('MyApp', ['ngMaterial'])

.controller('AppCtrl', function($scope) {
    var self = this;
    neo4j = neo4j.v1;
    var driver = neo4j.driver("bolt://127.0.0.1:7687", neo4j.auth.basic("admin", "admin"));
    var session = driver.session();

    self.referenceId = "hao123";
    self.create = function(){
        var result = session.run('MATCH (p:Person {referenceId: {id}}) RETURN p', {id: self.referenceId});
        result.then(function(data){
            if (data.records.length >= 1) {
                var record = data.records[0].get("p").properties;
                var p = {
                    name: record.name,
                    email: record.email
                };

                self.message = `Success: Name: ${p.name} - ${p.email}`;
                createUser();
            } else {
                self.message = "Error: Referece ID doesn't exist"
            }

            $scope.$apply();
        }, function(e){
            console.log(e)
        });
    };

    function createUser() {
        var key = new Date().getTime() + "";
        var parameters = {
            referenceId: key,
            name: self.name,
            email: self.email,
            key: self.referenceId
        };

        var result = session.run(
            'CREATE (p1:Person {name: {name}, email: {email}, referenceId: {referenceId}}) ', parameters);
        result.then(function(data){
            console.log(data);
            createRelationship(parameters);
        }, function(e){
            console.log(e)
        });
    }

    function createRelationship(p) {
        var result = session.run(
            'MATCH (p:Person), (p1:Person) ' +
            'WHERE p.referenceId = {key} AND p1.referenceId = {referenceId} ' +
            'CREATE (p1)-[r:Reference {id: {key}}]->(p)', p);
        result.then(function(data){
            console.log(data);
        }, function(e){
            console.log(e)
        });
    }
});
