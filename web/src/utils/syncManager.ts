import { useAuthStore } from '../store/authStore';
import { useMathStore } from '../store/mathStore';
import { useMathPracticeStore } from '../store/mathPracticeStore';
import { useGameStore } from '../store/gameStore';

class SyncManager {
  private static instance: SyncManager;
  private isOnline: boolean = navigator.onLine;

  private constructor() {
    window.addEventListener('online', () => this.handleOnlineStatusChange(true));
    window.addEventListener('offline', () => this.handleOnlineStatusChange(false));
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private handleOnlineStatusChange(online: boolean) {
    this.isOnline = online;
    if (online) {
      console.log('Network is back online, triggering sync...');
      this.triggerAllSync();
    } else {
      console.log('Network is offline, using local storage.');
    }
  }

  public async triggerAllSync() {
    const authStore = useAuthStore();
    
    // 只有在登录状态且在线时才同步
    if (!authStore.isAuthenticated || !navigator.onLine) {
      return;
    }

    console.log('Starting global sync...');
    
    const mathStore = useMathStore();
    const mathPracticeStore = useMathPracticeStore();
    const gameStore = useGameStore();

    try {
      await Promise.allSettled([
        mathStore.syncProgress(),
        mathPracticeStore.syncHistory(),
        gameStore.syncRecords()
      ]);
      console.log('Global sync completed.');
    } catch (err) {
      console.error('Global sync failed:', err);
    }
  }

  public getOnlineStatus() {
    return this.isOnline;
  }
}

export const syncManager = SyncManager.getInstance();
