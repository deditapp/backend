import admin from "firebase-admin";
import { CreateRequest } from "firebase-admin/lib/auth/auth-config";
import { UserRecord } from "firebase-admin/lib/auth/user-record";

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

const firebaseConfig = {
	apiKey: "AIzaSyCa8c7l6ZwxrDGX5bKwOyiizVekQ-vh5Lc",
	authDomain: "deditapp-auth.firebaseapp.com",
	projectId: "deditapp-auth",
	storageBucket: "deditapp-auth.appspot.com",
	messagingSenderId: "926805131176",
	appId: "1:926805131176:web:e5e8ee0d06a0f37255e79d",
	measurementId: "G-EQPSJRHCST",
};

const app = admin.initializeApp(firebaseConfig);

@Injectable()
export class FirebaseService {
	private get app() {
		return app;
	}

	constructor(private readonly config: ConfigService) {}

	/**
	 * Create a JWT for the user with the given UID.
	 * @param uid The user's UID.
	 */
	async createJwt(uid: string) {
		return this.app.auth().createCustomToken(uid);
	}

	/**
	 * List all users stored in Firebase.
	 * @returns A tuple containing the list of users and the pagination token.
	 */
	async listUsers(pageToken?: string): Promise<[UserRecord[], string?]> {
		const result = await this.app.auth().listUsers(undefined, pageToken);
		return [result.users, result.pageToken];
	}

	/**
	 * Create a new user.
	 * @param request The user creation request.
	 * @returns A new user record.
	 */
	async createUser(request: CreateRequest) {
		return this.app.auth().createUser(request);
	}

	async fetchLoginToken() {
		// return this.app.auth().createCustomToken();/
	}

	/**
	 * Fetch a user by a JWT token.
	 * @param token The JWT token.
	 * @returns A `UserRecord`, if the token is valid.
	 */
	async fetchUserFromToken(token: string): Promise<UserRecord | null> {
		const { uid } = await this.app
			.auth()
			.verifyIdToken(token, true)
			.catch(() => ({ uid: null }));
		// if the token is invalid, uid will be null
		if (!uid) {
			return null;
		}
		return this.app.auth().getUser(uid);
	}

	/**
	 * Generate a login link for a new user.
	 * @param email The user's email.
	 * @returns The login link.
	 */
	async generateLoginLink(email: string) {
		return this.app
			.auth()
			.generateSignInWithEmailLink(email, { url: this.config.getOrThrow("LOGIN_REDIRECT_URL") });
	}

	/**
	 * Verify a JWT.
	 * @param token The JWT to verify.
	 * @returns The user record.
	 */
	async verifyToken(token: string): Promise<boolean> {
		return this.app
			.auth()
			.verifyIdToken(token, true)
			.then(
				() => true,
				() => false
			);
	}
}
