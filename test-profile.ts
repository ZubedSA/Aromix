import { StoreService } from './src/services/store-service';

async function main() {
    try {
        console.log("Getting profile for id 'cmp9biosr0004i8045l77pejl' (Eko)...");
        const profile = await StoreService.getUserProfile('cmp9biosr0004i8045l77pejl');
        console.log("Success profile:", profile);
    } catch (e: any) {
        console.error("Error getUserProfile:", e);
    }

    try {
        console.log("Getting store profile for storeId 'cmp9bio330000i8047xvl264d' (Istana Parfum)...");
        const store = await StoreService.getStoreProfile('cmp9bio330000i8047xvl264d');
        console.log("Success store:", store);
    } catch (e: any) {
        console.error("Error getStoreProfile:", e);
    }
}

main();
