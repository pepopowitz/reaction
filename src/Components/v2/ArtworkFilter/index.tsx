import { isEqual } from "lodash"
import React, { useEffect, useState } from "react"
import useDeepCompareEffect from "use-deep-compare-effect"

import { createRefetchContainer, graphql, RelayRefetchProp } from "react-relay"

import { AnalyticsSchema, useSystemContext } from "Artsy"
import { useTracking } from "Artsy/Analytics/useTracking"
import { renderWithLoadProgress } from "Artsy/Relay/renderWithLoadProgress"
import { usePrevious } from "Utils/Hooks/usePrevious"
import { Media } from "Utils/Responsive"

import { ArtworkFilter_viewer } from "__generated__/ArtworkFilter_viewer.graphql"
import { ArtworkQueryFilterQuery as ArtworkFilterQueryType } from "__generated__/ArtworkQueryFilterQuery.graphql"

import { ArtworkFilterArtworkGridRefetchContainer as ArtworkFilterArtworkGrid } from "./ArtworkFilterArtworkGrid2"
import { SortFilter } from "./ArtworkFilters/SortFilter"

import {
  ArtworkFilterContextProvider,
  initialArtworkFilterState,
  SharedArtworkFilterContextProps,
  useArtworkFilterContext,
} from "./ArtworkFilterContext"

import { ArtworkFilterMobileActionSheet } from "./ArtworkFilterMobileActionSheet"
import { ArtworkFilters } from "./ArtworkFilters"

import {
  Box,
  Button,
  FilterIcon,
  Flex,
  Separator,
  Spacer,
} from "@artsy/palette"
import { ArtistArtworkFilter_artist } from "__generated__/ArtistArtworkFilter_artist.graphql"
import { Collection_collection } from "__generated__/Collection_collection.graphql"
import { SystemQueryRenderer as QueryRenderer } from "Artsy/Relay/SystemQueryRenderer"
import { ArtworkQueryFilter } from "./ArtworkQueryFilter"

/**
 * Primary ArtworkFilter which is wrapped with a context and refetch container.
 *
 * If needing more granular control over the query being used, or the root query
 * doesn't `extend Viewer`, the BaseArtworkFilter can be imported below. See
 * `Apps/Collection` for an example, which queries Kaws for data.
 */
export const ArtworkFilter: React.FC<SharedArtworkFilterContextProps & {
  viewer: any // FIXME: We need to support multiple types implementing different viewer interfaces
}> = ({
  viewer,
  aggregations,
  counts,
  filters,
  sortOptions,
  onArtworkBrickClick,
  onFilterClick,
  onChange,
  ZeroState,
}) => {
  return (
    <ArtworkFilterContextProvider
      aggregations={aggregations}
      counts={counts}
      filters={filters}
      sortOptions={sortOptions}
      onArtworkBrickClick={onArtworkBrickClick}
      onFilterClick={onFilterClick}
      onChange={onChange}
      ZeroState={ZeroState}
    >
      <ArtworkFilterRefetchContainer viewer={viewer} />
    </ArtworkFilterContextProvider>
  )
}

export const BaseArtworkFilter: React.FC<{
  relay: RelayRefetchProp
  relayVariables?: object
  viewer:
    | ArtworkFilter_viewer
    | Collection_collection
    | ArtistArtworkFilter_artist
}> = ({ relay, viewer, relayVariables = {}, ...props }) => {
  const { filtered_artworks } = viewer
  const hasFilter = filtered_artworks && filtered_artworks.id

  // If there was an error fetching the filter,
  // we still want to render the rest of the page.
  if (!hasFilter) return null

  const tracking = useTracking()
  const [isFetching, toggleFetching] = useState(false)
  const [showMobileActionSheet, toggleMobileActionSheet] = useState(false)
  const filterContext = useArtworkFilterContext()
  const previousFilters = usePrevious(filterContext.filters)

  /**
   * Check to see if the mobile action sheet is present and prevent scrolling
   */
  useEffect(() => {
    const setScrollable = doScroll => {
      document.body.style.overflowY = doScroll ? "visible" : "hidden"
    }
    if (showMobileActionSheet) {
      setScrollable(false)
    }
    return () => {
      setScrollable(true)
    }
  }, [showMobileActionSheet])

  /**
   * Check to see if the current filter is different from the previous filter
   * and trigger a reload.
   */
  useDeepCompareEffect(() => {
    Object.entries(filterContext.filters).forEach(
      ([filterKey, currentFilter]) => {
        const previousFilter = previousFilters[filterKey]
        const filtersHaveUpdated = !isEqual(currentFilter, previousFilter)

        if (filtersHaveUpdated) {
          fetchResults()

          tracking.trackEvent({
            action_type:
              AnalyticsSchema.ActionType.CommercialFilterParamsChanged,
            current: filterContext.filters,
            changed: {
              [filterKey]: filterContext.filters[filterKey],
            },
          })
        }
      }
    )
  }, [filterContext.filters])

  function fetchResults() {
    toggleFetching(true)

    const relayRefetchVariables = {
      ...filterContext.filters,
      ...relayVariables,
      first: 30,
    }

    relay.refetch(relayRefetchVariables, null, error => {
      if (error) {
        console.error(error)
      }

      toggleFetching(false)
    })
  }

  const ArtworkGrid = () => {
    return (
      <ArtworkFilterArtworkGrid
        filtered_artworks={viewer.filtered_artworks}
        isLoading={isFetching}
        columnCount={[2, 2, 2, 3]}
      />
    )
  }

  return (
    <Box>
      <Box id="jump--artworkFilter" />

      {/*
        Mobile Artwork Filter
      */}
      <Media at="xs">
        <Box mb={1}>
          {showMobileActionSheet && (
            <ArtworkFilterMobileActionSheet
              onClose={() => toggleMobileActionSheet(false)}
            >
              <ArtworkFilters />
            </ArtworkFilterMobileActionSheet>
          )}

          <Flex justifyContent="space-between" alignItems="center" py={1}>
            <Button size="small" onClick={() => toggleMobileActionSheet(true)}>
              <Flex justifyContent="space-between" alignItems="center">
                <FilterIcon fill="white100" />
                <Spacer mr={0.5} />
                Filter
              </Flex>
            </Button>

            <SortFilter />
          </Flex>

          <Spacer mb={2} />

          <ArtworkGrid />
        </Box>
      </Media>

      {/*
        Desktop Artwork Filter
      */}
      <Media greaterThan="xs">
        <Flex>
          <Box width="25%" mr={2} mt={0.5}>
            <ArtworkFilters />
          </Box>
          <Box width="75%">
            <Box mb={2}>
              <Box pb={2} mt={0.5}>
                <Separator />
              </Box>
              <SortFilter />
            </Box>

            {props.children || <ArtworkGrid />}
          </Box>
        </Flex>
      </Media>
    </Box>
  )
}

export const ArtworkFilterRefetchContainer = createRefetchContainer(
  BaseArtworkFilter,
  {
    viewer: graphql`
      fragment ArtworkFilter_viewer on Viewer
        @argumentDefinitions(
          acquireable: { type: "Boolean" }
          aggregations: { type: "[ArtworkAggregation]" }
          artistID: { type: "String" }
          atAuction: { type: "Boolean" }
          attributionClass: { type: "[String]" }
          color: { type: "String" }
          forSale: { type: "Boolean" }
          height: { type: "String" }
          inquireableOnly: { type: "Boolean" }
          keyword: { type: "String" }
          majorPeriods: { type: "[String]" }
          medium: { type: "String" }
          offerable: { type: "Boolean" }
          page: { type: "Int" }
          partnerID: { type: "ID" }
          priceRange: { type: "String" }
          sort: { type: "String", defaultValue: "-partner_updated_at" }
          width: { type: "String" }
          first: { type: "Int", defaultValue: 30 }
        ) {
        filtered_artworks: artworksConnection(
          acquireable: $acquireable
          aggregations: $aggregations
          artistID: $artistID
          atAuction: $atAuction
          attributionClass: $attributionClass
          color: $color
          forSale: $forSale
          height: $height
          inquireableOnly: $inquireableOnly
          keyword: $keyword
          majorPeriods: $majorPeriods
          medium: $medium
          offerable: $offerable
          page: $page
          partnerID: $partnerID
          priceRange: $priceRange
          sort: $sort
          width: $width
          first: $first
        ) {
          id
          ...ArtworkFilterArtworkGrid2_filtered_artworks
        }
      }
    `,
  },
  ArtworkQueryFilter
)

/**
 * This QueryRenderer can be used to instantiate stand-alone embedded ArtworkFilters
 * that are not dependent on URLBar state.
 */
export const ArtworkFilterQueryRenderer = ({ keyword = "andy warhol" }) => {
  const { relayEnvironment } = useSystemContext()

  return (
    <ArtworkFilterContextProvider
      filters={{
        ...initialArtworkFilterState,
        keyword,
      }}
    >
      <QueryRenderer<ArtworkFilterQueryType>
        environment={relayEnvironment}
        // FIXME: Passing a variable to `query` shouldn't error out in linter
        /* tslint:disable:relay-operation-generics */
        query={ArtworkQueryFilter}
        variables={{
          keyword,
        }}
        render={renderWithLoadProgress(ArtworkFilterRefetchContainer as any)} // FIXME: Find way to support union types here
      />
    </ArtworkFilterContextProvider>
  )
}
