import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Classroom_Key {
  id: UUIDString;
  __typename?: 'Classroom_Key';
}

export interface CreateUserData {
  user_insert: User_Key;
}

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

export interface GetSessionVariables {
  id: UUIDString;
}

export interface ListClassroomsData {
  classrooms: ({
    id: UUIDString;
    name: string;
    description?: string | null;
  } & Classroom_Key)[];
}

export interface Policy_Key {
  id: UUIDString;
  __typename?: 'Policy_Key';
}

export interface Session_Key {
  id: UUIDString;
  __typename?: 'Session_Key';
}

export interface Student_Key {
  id: UUIDString;
  __typename?: 'Student_Key';
}

export interface UpdatePolicyData {
  policy_update?: Policy_Key | null;
}

export interface UpdatePolicyVariables {
  id: UUIDString;
  value: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): MutationRef<CreateUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): MutationRef<CreateUserData, undefined>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(): MutationPromise<CreateUserData, undefined>;
export function createUser(dc: DataConnect): MutationPromise<CreateUserData, undefined>;

interface ListClassroomsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListClassroomsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListClassroomsData, undefined>;
  operationName: string;
}
export const listClassroomsRef: ListClassroomsRef;

export function listClassrooms(): QueryPromise<ListClassroomsData, undefined>;
export function listClassrooms(dc: DataConnect): QueryPromise<ListClassroomsData, undefined>;

interface UpdatePolicyRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePolicyVariables): MutationRef<UpdatePolicyData, UpdatePolicyVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePolicyVariables): MutationRef<UpdatePolicyData, UpdatePolicyVariables>;
  operationName: string;
}
export const updatePolicyRef: UpdatePolicyRef;

export function updatePolicy(vars: UpdatePolicyVariables): MutationPromise<UpdatePolicyData, UpdatePolicyVariables>;
export function updatePolicy(dc: DataConnect, vars: UpdatePolicyVariables): MutationPromise<UpdatePolicyData, UpdatePolicyVariables>;

interface GetSessionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetSessionVariables): QueryRef<GetSessionData, GetSessionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetSessionVariables): QueryRef<GetSessionData, GetSessionVariables>;
  operationName: string;
}
export const getSessionRef: GetSessionRef;

export function getSession(vars: GetSessionVariables): QueryPromise<GetSessionData, GetSessionVariables>;
export function getSession(dc: DataConnect, vars: GetSessionVariables): QueryPromise<GetSessionData, GetSessionVariables>;

