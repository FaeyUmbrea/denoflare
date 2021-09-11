export interface SiteConfig {

    // leave these out if no org
    readonly organization?: string // short first (bold) part of org name
    readonly organizationSuffix?: string // short second part of org name
    readonly organizationSvg?: string // content repo /path/to/organization.svg must use fill="currentColor"
    readonly organizationUrl?: string // abs url to org

    readonly product: string // (required) product name for sidebar, etc
    readonly productRepo?: string; // e.g. "ghuser/project-repo", used for gh link in header
    readonly productSvg: string // (required) content repo /path/to/product.svg must use fill="currentColor" 
    readonly contentRepo?: string; // e.g. "ghuser/docs-repo", used for edit this page in footer

    readonly themeColor?: string; // #rrggbb
    readonly themeColorDark?: string; // #rrggbb

    readonly siteMetadata: SiteMetadata; // (required for title, description, url)
}

export interface SiteMetadata {
    readonly title: string // (required) (html title, og:title, twitter:title) = <page title> · <siteMetadata.title>
    readonly description: string // (required) (html meta description, og:description, twitter:description) = <siteMetadata.description>
    readonly twitterUsername?: string // @asdf for twitter:site
    readonly image?: string // abs url to twitter:image
    readonly origin?: string // abs url to site (origin)
}
