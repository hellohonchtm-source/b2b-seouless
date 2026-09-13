// useAppData — central hook that loads app data from Supabase when
// a user is authenticated, falling back to mock data explicitly when not.
//
// Design rules:
//   • On auth success → fetch from Supabase. If the fetch errors, do NOT
//     silently overwrite local state; keep mock data and surface the error.
//   • When unauthenticated → use mock data, source = 'local'.
//   • Writes go to Supabase when authenticated; otherwise local-only.

import { useState, useEffect, useCallback } from 'react';
import {
  getAuthState,
  fetchProfiles,
  fetchProducts,
  fetchOrders,
  fetchAgentTasks,
  localProfiles,
  localProducts,
  localOrders,
  localAgentTasks,
  createProduct,
  createOrder,
  createAgentTask,
  DataSource,
  RepoReadResult,
  RepoWriteResult,
} from '../../lib/repository';
import { UserProfile, ProductCatalogItem, Order, AgentTask } from '../../types';
import { mockUserProfiles, mockProducts, mockOrders, mockAgentTasks } from '../data/mockData';

export interface AppDataState {
  loading: boolean;
  error: string | null;
  source: DataSource;
  authenticated: boolean;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  products: ProductCatalogItem[];
  orders: Order[];
  agentTasks: AgentTask[];
  setCurrentUser: (user: UserProfile) => void;
  addProduct: (product: ProductCatalogItem) => void;
  createNewOrder: (order: Order) => void;
  addAgentTask: (task: AgentTask) => void;
}

export function useAppData(): AppDataState {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<DataSource>('local');
  const [authenticated, setAuthenticated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<UserProfile[]>(mockUserProfiles);
  const [currentUser, setCurrentUser] = useState<UserProfile>(mockUserProfiles[0]);
  const [products, setProducts] = useState<ProductCatalogItem[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [agentTasks, setAgentTasks] = useState<AgentTask[]>(mockAgentTasks);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const auth = await getAuthState();
      if (cancelled) return;

      setAuthenticated(auth.authenticated);
      setUserId(auth.userId);

      if (!auth.authenticated) {
        // Explicit local fallback — not authenticated
        setSource('local');
        setError(null);
        setLoading(false);
        return;
      }

      // Authenticated: try all four domains in parallel
      setSource('supabase');
      const [profilesRes, productsRes, ordersRes, tasksRes] = await Promise.all([
        fetchProfiles(),
        fetchProducts(),
        fetchOrders(),
        fetchAgentTasks(),
      ]);

      if (cancelled) return;

      const errors: string[] = [];

      // Only overwrite local state if remote read succeeded.
      // If a domain errors, keep mock data and collect the error.
      if (profilesRes.source === 'supabase' && profilesRes.error === null && profilesRes.data.length > 0) {
        setAllUsers(profilesRes.data);
        if (!currentUser || currentUser.id === mockUserProfiles[0].id) {
          setCurrentUser(profilesRes.data[0]);
        }
      } else if (profilesRes.error) {
        errors.push(`Profiles: ${profilesRes.error}`);
      }

      if (productsRes.source === 'supabase' && productsRes.error === null) {
        setProducts(productsRes.data.length > 0 ? productsRes.data : mockProducts);
      } else if (productsRes.error) {
        errors.push(`Products: ${productsRes.error}`);
      }

      if (ordersRes.source === 'supabase' && ordersRes.error === null) {
        setOrders(ordersRes.data.length > 0 ? ordersRes.data : mockOrders);
      } else if (ordersRes.error) {
        errors.push(`Orders: ${ordersRes.error}`);
      }

      if (tasksRes.source === 'supabase' && tasksRes.error === null) {
        setAgentTasks(tasksRes.data.length > 0 ? tasksRes.data : mockAgentTasks);
      } else if (tasksRes.error) {
        errors.push(`Agent Tasks: ${tasksRes.error}`);
      }

      setError(errors.length > 0 ? errors.join('; ') : null);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- write handlers ----

  const addProduct = useCallback(
    (product: ProductCatalogItem) => {
      setProducts((prev) => [product, ...prev]);
      if (source === 'supabase' && authenticated) {
        createProduct(product, 'supabase').catch((e) => {
          console.error('Failed to persist product to Supabase:', e);
        });
      }
    },
    [source, authenticated]
  );

  const createNewOrder = useCallback(
    (order: Order) => {
      setOrders((prev) => [order, ...prev]);
      if (source === 'supabase' && authenticated) {
        createOrder(order, 'supabase').catch((e) => {
          console.error('Failed to persist order to Supabase:', e);
        });
      }
    },
    [source, authenticated]
  );

  const addAgentTask = useCallback(
    (task: AgentTask) => {
      setAgentTasks((prev) => [task, ...prev]);
      if (source === 'supabase' && authenticated && userId) {
        createAgentTask(task, userId, 'supabase').catch((e) => {
          console.error('Failed to persist agent task to Supabase:', e);
        });
      }
    },
    [source, authenticated, userId]
  );

  return {
    loading,
    error,
    source,
    authenticated,
    currentUser,
    allUsers,
    products,
    orders,
    agentTasks,
    setCurrentUser,
    addProduct,
    createNewOrder,
    addAgentTask,
  };
}
