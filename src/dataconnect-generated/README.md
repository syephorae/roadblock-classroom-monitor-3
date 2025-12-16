# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListClassrooms*](#listclassrooms)
  - [*GetSession*](#getsession)
- [**Mutations**](#mutations)
  - [*CreateUser*](#createuser)
  - [*UpdatePolicy*](#updatepolicy)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListClassrooms
You can execute the `ListClassrooms` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listClassrooms(): QueryPromise<ListClassroomsData, undefined>;

interface ListClassroomsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListClassroomsData, undefined>;
}
export const listClassroomsRef: ListClassroomsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listClassrooms(dc: DataConnect): QueryPromise<ListClassroomsData, undefined>;

interface ListClassroomsRef {
  ...
  (dc: DataConnect): QueryRef<ListClassroomsData, undefined>;
}
export const listClassroomsRef: ListClassroomsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listClassroomsRef:
```typescript
const name = listClassroomsRef.operationName;
console.log(name);
```

### Variables
The `ListClassrooms` query has no variables.
### Return Type
Recall that executing the `ListClassrooms` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListClassroomsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListClassroomsData {
  classrooms: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Classroom_Key)[];
}
```
### Using `ListClassrooms`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listClassrooms } from '@dataconnect/generated';


// Call the `listClassrooms()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listClassrooms();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listClassrooms(dataConnect);

console.log(data.classrooms);

// Or, you can use the `Promise` API.
listClassrooms().then((response) => {
  const data = response.data;
  console.log(data.classrooms);
});
```

### Using `ListClassrooms`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listClassroomsRef } from '@dataconnect/generated';


// Call the `listClassroomsRef()` function to get a reference to the query.
const ref = listClassroomsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listClassroomsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.classrooms);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.classrooms);
});
```

## GetSession
You can execute the `GetSession` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getSession(vars: GetSessionVariables): QueryPromise<GetSessionData, GetSessionVariables>;

interface GetSessionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSessionVariables): QueryRef<GetSessionData, GetSessionVariables>;
}
export const getSessionRef: GetSessionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getSession(dc: DataConnect, vars: GetSessionVariables): QueryPromise<GetSessionData, GetSessionVariables>;

interface GetSessionRef {
  ...
  (dc: DataConnect, vars: GetSessionVariables): QueryRef<GetSessionData, GetSessionVariables>;
}
export const getSessionRef: GetSessionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getSessionRef:
```typescript
const name = getSessionRef.operationName;
console.log(name);
```

### Variables
The `GetSession` query requires an argument of type `GetSessionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetSessionVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetSession` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetSessionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetSessionData {
  session?: {
    id: UUIDString;
    startTime: TimestampString;
    endTime?: TimestampString | null;
    isActive: boolean;
    classroom?: {
      id: UUIDString;
      name: string;
    } & Classroom_Key;
      teacher?: {
        id: UUIDString;
        displayName: string;
      } & User_Key;
  } & Session_Key;
}
```
### Using `GetSession`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getSession, GetSessionVariables } from '@dataconnect/generated';

// The `GetSession` query requires an argument of type `GetSessionVariables`:
const getSessionVars: GetSessionVariables = {
  id: ..., 
};

// Call the `getSession()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getSession(getSessionVars);
// Variables can be defined inline as well.
const { data } = await getSession({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getSession(dataConnect, getSessionVars);

console.log(data.session);

// Or, you can use the `Promise` API.
getSession(getSessionVars).then((response) => {
  const data = response.data;
  console.log(data.session);
});
```

### Using `GetSession`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getSessionRef, GetSessionVariables } from '@dataconnect/generated';

// The `GetSession` query requires an argument of type `GetSessionVariables`:
const getSessionVars: GetSessionVariables = {
  id: ..., 
};

// Call the `getSessionRef()` function to get a reference to the query.
const ref = getSessionRef(getSessionVars);
// Variables can be defined inline as well.
const ref = getSessionRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getSessionRef(dataConnect, getSessionVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.session);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.session);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateUser
You can execute the `CreateUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createUser(): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface CreateUserRef {
  ...
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
}
export const createUserRef: CreateUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createUserRef:
```typescript
const name = createUserRef.operationName;
console.log(name);
```

### Variables
The `CreateUser` mutation has no variables.
### Return Type
Recall that executing the `CreateUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateUserData {
  user_insert: User_Key;
}
```
### Using `CreateUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createUser } from '@dataconnect/generated';


// Call the `createUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createUser(dataConnect);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createUser().then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createUserRef } from '@dataconnect/generated';


// Call the `createUserRef()` function to get a reference to the mutation.
const ref = createUserRef();

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createUserRef(dataConnect);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdatePolicy
You can execute the `UpdatePolicy` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePolicy(vars: UpdatePolicyVariables): MutationPromise<UpdatePolicyData, UpdatePolicyVariables>;

interface UpdatePolicyRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePolicyVariables): MutationRef<UpdatePolicyData, UpdatePolicyVariables>;
}
export const updatePolicyRef: UpdatePolicyRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePolicy(dc: DataConnect, vars: UpdatePolicyVariables): MutationPromise<UpdatePolicyData, UpdatePolicyVariables>;

interface UpdatePolicyRef {
  ...
  (dc: DataConnect, vars: UpdatePolicyVariables): MutationRef<UpdatePolicyData, UpdatePolicyVariables>;
}
export const updatePolicyRef: UpdatePolicyRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePolicyRef:
```typescript
const name = updatePolicyRef.operationName;
console.log(name);
```

### Variables
The `UpdatePolicy` mutation requires an argument of type `UpdatePolicyVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePolicyVariables {
  id: UUIDString;
  value: string;
}
```
### Return Type
Recall that executing the `UpdatePolicy` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePolicyData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePolicyData {
  policy_update?: Policy_Key | null;
}
```
### Using `UpdatePolicy`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePolicy, UpdatePolicyVariables } from '@dataconnect/generated';

// The `UpdatePolicy` mutation requires an argument of type `UpdatePolicyVariables`:
const updatePolicyVars: UpdatePolicyVariables = {
  id: ..., 
  value: ..., 
};

// Call the `updatePolicy()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePolicy(updatePolicyVars);
// Variables can be defined inline as well.
const { data } = await updatePolicy({ id: ..., value: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePolicy(dataConnect, updatePolicyVars);

console.log(data.policy_update);

// Or, you can use the `Promise` API.
updatePolicy(updatePolicyVars).then((response) => {
  const data = response.data;
  console.log(data.policy_update);
});
```

### Using `UpdatePolicy`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePolicyRef, UpdatePolicyVariables } from '@dataconnect/generated';

// The `UpdatePolicy` mutation requires an argument of type `UpdatePolicyVariables`:
const updatePolicyVars: UpdatePolicyVariables = {
  id: ..., 
  value: ..., 
};

// Call the `updatePolicyRef()` function to get a reference to the mutation.
const ref = updatePolicyRef(updatePolicyVars);
// Variables can be defined inline as well.
const ref = updatePolicyRef({ id: ..., value: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePolicyRef(dataConnect, updatePolicyVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.policy_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.policy_update);
});
```

