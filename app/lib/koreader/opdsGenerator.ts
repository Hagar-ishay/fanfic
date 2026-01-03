/**
 * OPDS (Open Publication Distribution System) XML generator
 * for KOReader integration
 */

import { XMLBuilder } from "fast-xml-parser";

export interface OPDSEntry {
  id: string;
  title: string;
  updated: Date;
  author?: string;
  summary?: string;
  categories?: string[];
  links: OPDSLink[];
}

export interface OPDSLink {
  rel: string;
  type: string;
  href: string;
  title?: string;
}

export interface OPDSFeed {
  id: string;
  title: string;
  updated: Date;
  author?: {
    name: string;
    uri?: string;
  };
  links: OPDSLink[];
  entries: OPDSEntry[];
}

/**
 * Generate OPDS catalog XML
 */
export function generateOPDSCatalog(feed: OPDSFeed): string {
  const builder = new XMLBuilder({
    format: true,
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });

  const feedObj = {
    "?xml": {
      "@_version": "1.0",
      "@_encoding": "UTF-8",
    },
    feed: {
      "@_xmlns": "http://www.w3.org/2005/Atom",
      "@_xmlns:dc": "http://purl.org/dc/elements/1.1/",
      "@_xmlns:opds": "http://opds-spec.org/2010/catalog",
      id: feed.id,
      title: feed.title,
      updated: feed.updated.toISOString(),
      ...(feed.author && {
        author: {
          name: feed.author.name,
          ...(feed.author.uri && { uri: feed.author.uri }),
        },
      }),
      link: feed.links.map((link) => ({
        "@_rel": link.rel,
        "@_type": link.type,
        "@_href": link.href,
        ...(link.title && { "@_title": link.title }),
      })),
      entry: feed.entries.map((entry) => ({
        id: entry.id,
        title: entry.title,
        updated: entry.updated.toISOString(),
        ...(entry.author && { "dc:creator": entry.author }),
        ...(entry.summary && { summary: entry.summary }),
        ...(entry.categories &&
          entry.categories.length > 0 && {
            category: entry.categories.map((cat) => ({
              "@_term": cat,
              "@_label": cat,
            })),
          }),
        link: entry.links.map((link) => ({
          "@_rel": link.rel,
          "@_type": link.type,
          "@_href": link.href,
          ...(link.title && { "@_title": link.title }),
        })),
      })),
    },
  };

  return builder.build(feedObj);
}

/**
 * Create navigation link (for catalog browsing)
 */
export function createNavigationLink(
  href: string,
  title: string
): OPDSLink {
  return {
    rel: "subsection",
    type: "application/atom+xml;profile=opds-catalog;kind=navigation",
    href,
    title,
  };
}

/**
 * Create acquisition link (for downloading books)
 */
export function createAcquisitionLink(href: string): OPDSLink {
  return {
    rel: "http://opds-spec.org/acquisition",
    type: "application/epub+zip",
    href,
  };
}

/**
 * Create self link (current feed URL)
 */
export function createSelfLink(href: string): OPDSLink {
  return {
    rel: "self",
    type: "application/atom+xml;profile=opds-catalog",
    href,
  };
}

/**
 * Create start link (root catalog URL)
 */
export function createStartLink(href: string): OPDSLink {
  return {
    rel: "start",
    type: "application/atom+xml;profile=opds-catalog",
    href,
  };
}

/**
 * Create up link (parent catalog URL)
 */
export function createUpLink(href: string): OPDSLink {
  return {
    rel: "up",
    type: "application/atom+xml;profile=opds-catalog",
    href,
  };
}
