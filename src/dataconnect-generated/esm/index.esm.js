import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'studio',
  location: 'us-east1'
};

export const createUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateUser');
}
createUserRef.operationName = 'CreateUser';

export function createUser(dc) {
  return executeMutation(createUserRef(dc));
}

export const listClassroomsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListClassrooms');
}
listClassroomsRef.operationName = 'ListClassrooms';

export function listClassrooms(dc) {
  return executeQuery(listClassroomsRef(dc));
}

export const updatePolicyRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePolicy', inputVars);
}
updatePolicyRef.operationName = 'UpdatePolicy';

export function updatePolicy(dcOrVars, vars) {
  return executeMutation(updatePolicyRef(dcOrVars, vars));
}

export const getSessionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetSession', inputVars);
}
getSessionRef.operationName = 'GetSession';

export function getSession(dcOrVars, vars) {
  return executeQuery(getSessionRef(dcOrVars, vars));
}

