import { Injectable, Logger } from "@nestjs/common";

import { FirebaseService } from "./firebase.service";
import { PrismaService } from "./prisma.service";

interface UserCreatePayload {
	email: string;
	password: string;
}

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService, private readonly firebase: FirebaseService) {}

	/**
	 * Create a new user.
	 * @param param0 The user's email and password.
	 */
	async createUser({ email, password }: UserCreatePayload) {
		const firebaseUser = await this.firebase.createUser({ email, password });
		this.prisma.user.create({ data: { firebaseUid: firebaseUser.uid } });
	}

	/**
	 * Get a user by their JWT.
	 * @param token The JWT token.
	 * @returns The user record, if the token is valid.
	 */
	async fetchUserFromToken(token: string) {
		const user = await this.firebase.fetchUserFromToken(token);
		if (!user) {
			return null;
		}
		return this.prisma.user.findUnique({ where: { firebaseUid: user.uid } });
	}

	/**
	 * Fetch a user from their Firebase UID.
	 * @param uid The Firebase UID.
	 * @returns The `User`, if they were found.
	 */
	async fetchUserFromUid(uid: string) {
		return this.prisma.user.findUnique({ where: { firebaseUid: uid } });
	}

	/**
	 * Log a user in.
	 * @param email The user's email address.
	 * @returns The user's JWT token.
	 */
	async generateLoginLink(email: string): Promise<string> {
		return await this.firebase.generateLoginLink(email);
	}

	/**
	 * Verify a user's token.
	 * @param token The token to verify.
	 * @returns True if the token is valid.
	 */
	async verifyToken(token: string): Promise<boolean> {
		this.logger.log(`Verifying token ${token}`);
		return await this.firebase.verifyToken(token);
	}

	/**
	 * Test if the target user can access the given document.
	 * @param userId
	 * @param documentId
	 * @returns
	 */
	async canAccessDocument(userId: string, documentId: string) {
		const document = this.prisma.document.findFirst({
			where: {
				id: documentId,
				ownerId: userId,
			},
		});
		return !!document;
	}

	/**
	 * Fetch a list of documents owned by the target user.
	 * @param userId The user's ID.
	 */
	async fetchOwnedDocuments(userId: string) {
		return this.prisma.document.findMany({
			where: {
				ownerId: userId,
			},
		});
	}

	/**
	 * Fetch a document by its ID and the ID of its owner.
	 * @param userId The ID of the document's owner.
	 * @param documentId The ID of the document.
	 * @returns
	 */
	async fetchOwnedDocument(userId: string, documentId: string) {
		return this.prisma.document.findFirst({
			where: {
				id: documentId,
				ownerId: userId,
			},
		});
	}
}
