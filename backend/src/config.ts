import dotenv from 'dotenv';

dotenv.config();

export type DataProviderType = 'postgres' | 'firestore';

export interface FirestoreConfig {
    credentialsPath?: string; // Path to service account JSON file
    projectId?: string;
    clientEmail?: string;
    privateKey?: string;
}

export interface AppConfig {
    dataProvider: DataProviderType;
    databaseUrl?: string;
    firestore: FirestoreConfig;
}

function validateFirestoreConfig(cfg: FirestoreConfig) {
    // If GOOGLE_APPLICATION_CREDENTIALS is set (via env or config), that's sufficient
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS || cfg.credentialsPath) {
        return;
    }
    
    // Otherwise, require inline credentials for backward compatibility
    const missing = [];
    if (!cfg.projectId) missing.push('FIRESTORE_PROJECT_ID');
    if (!cfg.clientEmail) missing.push('FIRESTORE_CLIENT_EMAIL');
    if (!cfg.privateKey) missing.push('FIRESTORE_PRIVATE_KEY');
    if (missing.length) {
        throw new Error(`Missing Firestore credentials: either set GOOGLE_APPLICATION_CREDENTIALS (path to JSON file) or provide ${missing.join(', ')}`);
    }
}

export function loadConfig(): AppConfig {
    const dataProvider = (process.env.DATA_PROVIDER || 'firestore') as DataProviderType;

    // Prefer JSON file path (GOOGLE_APPLICATION_CREDENTIALS) for simplicity
    const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

    // Fallback to inline credentials for backward compatibility
    const firestorePrivateKey = process.env.FIRESTORE_PRIVATE_KEY
        ? process.env.FIRESTORE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

    const config: AppConfig = {
        dataProvider,
        databaseUrl: process.env.DATABASE_URL,
        firestore: {
            credentialsPath,
            projectId: process.env.FIRESTORE_PROJECT_ID,
            clientEmail: process.env.FIRESTORE_CLIENT_EMAIL,
            privateKey: firestorePrivateKey,
        },
    };

    if (config.dataProvider === 'firestore') {
        validateFirestoreConfig(config.firestore);
    }

    return config;
}

