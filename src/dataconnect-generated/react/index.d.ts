import { CreateUserData, ListClassroomsData, UpdatePolicyData, UpdatePolicyVariables, GetSessionData, GetSessionVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useCreateUser(options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;
export function useCreateUser(dc: DataConnect, options?: useDataConnectMutationOptions<CreateUserData, FirebaseError, void>): UseDataConnectMutationResult<CreateUserData, undefined>;

export function useListClassrooms(options?: useDataConnectQueryOptions<ListClassroomsData>): UseDataConnectQueryResult<ListClassroomsData, undefined>;
export function useListClassrooms(dc: DataConnect, options?: useDataConnectQueryOptions<ListClassroomsData>): UseDataConnectQueryResult<ListClassroomsData, undefined>;

export function useUpdatePolicy(options?: useDataConnectMutationOptions<UpdatePolicyData, FirebaseError, UpdatePolicyVariables>): UseDataConnectMutationResult<UpdatePolicyData, UpdatePolicyVariables>;
export function useUpdatePolicy(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePolicyData, FirebaseError, UpdatePolicyVariables>): UseDataConnectMutationResult<UpdatePolicyData, UpdatePolicyVariables>;

export function useGetSession(vars: GetSessionVariables, options?: useDataConnectQueryOptions<GetSessionData>): UseDataConnectQueryResult<GetSessionData, GetSessionVariables>;
export function useGetSession(dc: DataConnect, vars: GetSessionVariables, options?: useDataConnectQueryOptions<GetSessionData>): UseDataConnectQueryResult<GetSessionData, GetSessionVariables>;
