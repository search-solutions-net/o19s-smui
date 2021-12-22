import {User} from "./user.model";

export class SmuiVersionInfo {
  latestMarketStandard?: string;
  current?: string;
  infoType: string;
  msgHtml: string;
}

export class AuthInfoModel {
  currentUser: User;
  teams: String[];
  solrIndices: String[];
  isLoginRequired: boolean;
  isLoggedIn: boolean;
  authAction: String;
}
