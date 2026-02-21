export {}
declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            title?: "Doctor" | "Staff" | "Admin";
        };
    }
}