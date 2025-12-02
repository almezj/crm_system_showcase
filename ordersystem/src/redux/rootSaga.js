import { all } from "redux-saga/effects";
import authSaga from "./auth/saga";
import personsSaga from "./persons/saga";
import orderSaga from "./orders/saga";
import proposalSaga from "./proposals/saga";
import productSaga from "./products/saga";
import manufacturerSaga from "./manufacturers/saga";
import roleSaga from "./roles/saga";
import permissionSaga from "./permissions/saga";
import userSaga from "./users/saga";
import languagesSaga from "./languages/saga";
import materialsSaga from "./materials/saga";
import dashboardSaga from "./dashboard/saga";
import piecesSaga from "./pieces/saga";
import pieceImagesSaga from "./pieceImages/saga";
import { proposalItemPieceMaterialsSaga } from "./proposalItemPieceMaterials/saga";
import appSaga from "./app/saga";

export default function* rootSaga() {
  yield all([
    vehicleSaga(),
    authSaga(),
    personsSaga(),
    orderSaga(),
    proposalSaga(),
    productSaga(),
    manufacturerSaga(),
    roleSaga(),
    permissionSaga(),
    userSaga(),
    languagesSaga(),
    materialsSaga(),
    dashboardSaga(),
    piecesSaga(),
    pieceImagesSaga(),
    proposalItemPieceMaterialsSaga(),
    appSaga(),
  ]);
}
