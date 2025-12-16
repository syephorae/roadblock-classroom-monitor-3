const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east1'
};
exports.connectorConfig = connectorConfig;

const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';
exports.createUserRef = createUserRef;

exports.createUser = function createUser(dc) {
  return executeMutation(createUserRef(dc));
};

const listClassroomsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListClassrooms');
}
listClassroomsRef.operationName = 'ListClassrooms';
exports.listClassroomsRef = listClassroomsRef;

exports.listClassrooms = function listClassrooms(dc) {
  return executeQuery(listClassroomsRef(dc));
};

const updatePolicyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePolicy', inputVars);
}
updatePolicyRef.operationName = 'UpdatePolicy';
exports.updatePolicyRef = updatePolicyRef;

exports.updatePolicy = function updatePolicy(dcOrVars, vars) {
  return executeMutation(updatePolicyRef(dcOrVars, vars));
};

const getSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSession', inputVars);
}
getSessionRef.operationName = 'GetSession';
exports.getSessionRef = getSessionRef;

exports.getSession = function getSession(dcOrVars, vars) {
  return executeQuery(getSessionRef(dcOrVars, vars));
};
