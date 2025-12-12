import * as admin from 'firebase-admin';
import { PrismaClient } from '@prisma/client';
import { AppConfig } from '../config';
import { DataProvider } from './DataProvider';
import { FirestoreDataProvider } from './providers/firestoreProvider';
import { PostgresDataProvider } from './providers/postgresProvider';

export function createDataProvider(config: AppConfig): DataProvider {
    if (config.dataProvider === 'firestore') {
        // Initialize Firebase Admin if not already initialized
        if (!admin.apps.length) {
            // Prefer GOOGLE_APPLICATION_CREDENTIALS env var (JSON file path)
            // This is automatically read by applicationDefault()
            if (process.env.GOOGLE_APPLICATION_CREDENTIALS || config.firestore.credentialsPath) {
                admin.initializeApp({
                    credential: admin.credential.applicationDefault(),
                });
            } else if (config.firestore.projectId && config.firestore.clientEmail && config.firestore.privateKey) {
                // Fallback to inline credentials (backward compatible)
                admin.initializeApp({
                    credential: admin.credential.cert({
                        projectId: config.firestore.projectId,
                        clientEmail: config.firestore.clientEmail,
                        privateKey: config.firestore.privateKey,
                    }),
                });
            } else {
                throw new Error('Firestore credentials not configured');
            }
        }
        
        const firestore = admin.firestore();
        return new FirestoreDataProvider(firestore);
    }

    const prisma = new PrismaClient({
        datasources: config.databaseUrl ? { db: { url: config.databaseUrl } } : undefined,
    });
    return new PostgresDataProvider(prisma);
}

