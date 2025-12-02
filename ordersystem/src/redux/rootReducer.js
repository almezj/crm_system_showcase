import { combineReducers } from "redux";
import authReducer from "./auth/reducer";
import personsReducer from "./persons/reducer";
import orderReducer from "./orders/reducer";
import proposalReducer from "./proposals/reducer";
import productReducer from "./products/reducer";
import manufacturerReducer from "./manufacturers/reducer";
import roleReducer from "./roles/reducer";
import permissionReducer from "./permissions/reducer";
import userReducer from "./users/reducer";
import languagesReducer from "./languages/reducer";
import materialsReducer from "./materials/reducer";
import dashboardReducer from "./dashboard/reducer";
import piecesReducer from "./pieces/reducer";
import pieceImagesReducer from "./pieceImages/reducer";
import proposalItemPieceMaterialsReducer from "./proposalItemPieceMaterials/reducer";
import appReducer from "./app/reducer";

const rootReducer = combineReducers({
  vehicles: vehicleReducer,
  auth: authReducer,
  persons: personsReducer,
  orders: orderReducer,
  proposals: proposalReducer,
  products: productReducer,
  manufacturers: manufacturerReducer,
  roles: roleReducer,
  permissions: permissionReducer,
  users: userReducer,
  languages: languagesReducer,
  materials: materialsReducer,
  dashboard: dashboardReducer,
  pieces: piecesReducer,
  pieceImages: pieceImagesReducer,
  proposalItemPieceMaterials: proposalItemPieceMaterialsReducer,
  app: appReducer,
});

export default rootReducer;
