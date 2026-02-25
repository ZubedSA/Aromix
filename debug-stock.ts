import { prisma } from './src/lib/prisma';

async function debugProducts() {
    const products = await prisma.product.findMany({
        include: {
            formula: {
                include: {
                    items: {
                        include: {
                            ingredient: true
                        }
                    }
                }
            }
        }
    });

    console.log(JSON.stringify(products, null, 2));
}

debugProducts();
