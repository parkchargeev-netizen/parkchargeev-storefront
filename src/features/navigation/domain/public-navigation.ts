export type PublicNavigationItem = {
  id?: string;
  label: string;
  href: string;
  opensInNewTab?: boolean;
  rel?: string | null;
};

export type PublicSiteNavigation = {
  primary: ReadonlyArray<PublicNavigationItem>;
  footer: ReadonlyArray<PublicNavigationItem>;
  legal: ReadonlyArray<PublicNavigationItem>;
};
