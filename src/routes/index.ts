import { Router } from 'express';
import authRouter from './auth.routes';
import thirdPartyRouter from './thirdParty.routes';
import categoryRouter from './category.routes';
import brandRouter from './brand.routes';
import productRouter from './product.routes';
import accountingAccountRouter from './accountingAccount.routes';
import tenantRouter from './tenant.routes';
import restaurantTableRouter from './restaurantTable.routes';
import serviceSpecialistRouter from './serviceSpecialist.routes';
import locationRouter from './location.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/third-parties', thirdPartyRouter);
router.use('/contacts', thirdPartyRouter);
router.use('/categories', categoryRouter);
router.use('/brands', brandRouter);
router.use('/products', productRouter);
router.use('/accounting-accounts', accountingAccountRouter);
router.use('/tenants', tenantRouter);
router.use('/restaurant-tables', restaurantTableRouter);
router.use('/service-specialists', serviceSpecialistRouter);
router.use('/locations', locationRouter);

export default router;
