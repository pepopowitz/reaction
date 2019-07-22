import { EntityHeader, ReadMore } from "@artsy/palette"
import { AnalyticsSchema } from "Artsy/Analytics"
import { unica } from "Assets/Fonts"
import { cloneDeep, filter, take } from "lodash"
import React, { FC, useState } from "react"
import { createFragmentContainer, graphql } from "react-relay"
import { data as sd } from "sharify"
import styled from "styled-components"
import { slugify } from "underscore.string"
import { resize } from "Utils/resizer"
import { Responsive } from "Utils/Responsive"

import {
  Box,
  Col,
  color,
  Flex,
  Grid,
  media,
  Row,
  Sans,
  Serif,
  Spacer,
} from "@artsy/palette"
import { Header_artworks } from "__generated__/Header_artworks.graphql"
import { useSystemContext } from "Artsy"
import { FollowArtistButtonFragmentContainer as FollowArtistButton } from "Components/FollowButton/FollowArtistButton"
import { AuthModalIntent, openAuthModal } from "Utils/openAuthModal"

// TODO: Update query interface when we know the schema
export interface Props {
  collection: {
    artist_ids?: string[]
    category: string
    credit?: string
    description?: string
    gene_ids?: string[]
    headerImage: string
    major_periods?: string[]
    medium?: string
    slug: string
    title: string
    query: any
  }
  artworks: Header_artworks
}

const handleOpenAuth = (mediator, artist) => {
  openAuthModal(mediator, {
    entity: artist,
    contextModule: AnalyticsSchema.ContextModule.CollectionDescription,
    intent: AuthModalIntent.FollowArtist,
  })
}

export const getWidth = () => {
  let width: number
  try {
    width = window.innerWidth
  } catch (e) {
    width = 0
  }
  return width
}

export const getFeaturedArtists = (
  artistsCount: number,
  collection,
  isColumnLayout: boolean,
  merchandisableArtists,
  mediator,
  user
) => {
  let featuredArtists

  if (collection.query.artist_ids.length > 0) {
    featuredArtists = filter(merchandisableArtists, artist =>
      collection.query.artist_ids.includes(artist._id)
    )

    return featuredArtistsEntityCollection(
      featuredArtists,
      isColumnLayout,
      mediator,
      user
    )
  }

  if (merchandisableArtists.length > 0) {
    return featuredArtistsEntityCollection(
      take(merchandisableArtists, artistsCount),
      isColumnLayout,
      mediator,
      user
    )
  }
}

export const featuredArtistsEntityCollection = (
  artists,
  isColumnLayout,
  mediator,
  user
) => {
  return artists.map((artist, index) => {
    const hasArtistMetaData = artist.nationality && artist.birthday
    return (
      <EntityContainer
        width={["100%", "33%", "33%", "25%"]}
        isColumnLayout={isColumnLayout}
        key={index}
        pb={20}
      >
        <EntityHeader
          imageUrl={artist.imageUrl}
          name={artist.name}
          meta={
            hasArtistMetaData
              ? `${artist.nationality}, b. ${artist.birthday}`
              : null
          }
          href={`/artist/${artist.id}`}
          FollowButton={
            <FollowArtistButton
              artist={artist}
              user={user}
              trackingData={{
                modelName: AnalyticsSchema.OwnerType.Artist,
                context_module:
                  AnalyticsSchema.ContextModule.CollectionDescription,
                entity_id: artist._id,
                entity_slug: artist.id,
              }}
              onOpenAuthModal={() => handleOpenAuth(mediator, artist)}
              render={({ is_followed }) => {
                return (
                  <Sans
                    size="2"
                    weight="medium"
                    color="black"
                    style={{
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    {is_followed ? "Following" : "Follow"}
                  </Sans>
                )
              }}
            />
          }
        />
      </EntityContainer>
    )
  })
}

const maxChars = {
  xs: 350,
  sm: 730,
  md: 670,
  lg: 660,
  xl: 820,
}

const imageWidthSizes = {
  xs: 320,
  sm: 688,
  md: 820,
  lg: 944,
  xl: 1112,
}

export const CollectionHeader: FC<Props> = ({ artworks, collection }) => {
  const { user, mediator } = useSystemContext()
  const [showMore, setShowMore] = useState(false)
  const hasMultipleArtists =
    artworks.merchandisable_artists &&
    artworks.merchandisable_artists.length > 1

  // TODO: Add test here to test this method works as expected
  const truncateFeaturedArtists = (featuredArtists, isColumnLayout) => {
    const width = getWidth()
    const truncatedLength = sd.IS_MOBILE
      ? 3
      : width > 1024
      ? 7
      : width > 768
      ? 5
      : 3

    if (featuredArtists.length <= truncatedLength) {
      return featuredArtists
    }

    const remainingArtists = featuredArtists.length - truncatedLength
    const viewMore = (
      <EntityContainer
        width={["100%", "33%", "33%", "25%"]}
        isColumnLayout={isColumnLayout}
        pb={20}
        key={4}
      >
        <ViewMore
          onClick={() => {
            setShowMore(true)
          }}
        >
          <EntityHeader initials={`+ ${remainingArtists}`} name="View more" />
        </ViewMore>
      </EntityContainer>
    )
    const artists = cloneDeep(featuredArtists)
    // TODO: Add test for splice method
    artists.splice(truncatedLength, remainingArtists, viewMore)

    // TODO: Add test for each case that can be returned
    return showMore ? featuredArtists : artists
  }

  // TODO: casting description as any allows this to pass type-checking, but
  //  the test that uses a JSX description will fail anyway, so we should
  //  fix this to account for that.
  const htmlUnsafeDescription = collection.description && (
    <span dangerouslySetInnerHTML={{ __html: collection.description as any }} />
  )

  return (
    <Responsive>
      {({ xs, sm, md, lg }) => {
        const size = xs ? "xs" : sm ? "sm" : md ? "md" : lg ? "lg" : "xl"
        const imageWidth = imageWidthSizes[size]
        const imageHeight = xs ? 160 : 240
        const chars = maxChars[size]
        const categoryTarget = `/collections#${slugify(collection.category)}`
        const artistsCount = size === "xs" ? 9 : 12
        const isColumnLayout =
          hasMultipleArtists || !collection.description || size === "xs"
        const smallerScreen = size === "xs" || size === "sm"
        const featuredArtists = getFeaturedArtists(
          artistsCount,
          collection,
          isColumnLayout,
          artworks.merchandisable_artists,
          mediator,
          user
        )

        return (
          <header>
            <Flex flexDirection="column">
              <Box>
                <Background
                  p={2}
                  mt={[0, 3]}
                  mb={3}
                  headerImageUrl={resize(collection.headerImage, {
                    width: imageWidth * (xs ? 2 : 1),
                    height: imageHeight * (xs ? 2 : 1),
                    quality: 80,
                  })}
                  height={imageHeight}
                >
                  <Overlay />
                  {collection.credit && (
                    <ImageCaption
                      size={size}
                      dangerouslySetInnerHTML={{ __html: collection.credit }}
                    />
                  )}
                </Background>
                <MetaContainer mb={2}>
                  <BreadcrumbContainer size={["2", "3"]}>
                    <a href="/collect">All works</a> /{" "}
                    <a href={categoryTarget}>{collection.category}</a>
                  </BreadcrumbContainer>
                  <Spacer mt={1} />
                  <Serif size={["6", "10"]}>{collection.title}</Serif>
                </MetaContainer>
                <Grid>
                  <Row>
                    <Col sm="12" md="8">
                      <Flex>
                        <ExtendedSerif size="3">
                          {smallerScreen ? (
                            <ReadMore
                              maxChars={chars}
                              content={htmlUnsafeDescription}
                            />
                          ) : (
                            htmlUnsafeDescription
                          )}
                          {collection.description && <Spacer mt={2} />}
                        </ExtendedSerif>
                      </Flex>
                    </Col>
                    <Col sm={12} md={12}>
                      {featuredArtists.length > 0 && (
                        // TODO: Add test here to test when featuredArtists are present and not
                        <Box pb={10}>
                          <Sans size="2" weight="medium" pb={15}>
                            {`Featured Artist${hasMultipleArtists ? "s" : ""}`}
                          </Sans>
                          <Flex flexWrap={isColumnLayout ? "wrap" : "nowrap"}>
                            {truncateFeaturedArtists(
                              featuredArtists,
                              isColumnLayout
                            )}
                          </Flex>
                        </Box>
                      )}
                    </Col>
                  </Row>
                </Grid>
                <Spacer mb={1} />
              </Box>
            </Flex>
            <Spacer mb={2} />
          </header>
        )
      }}
    </Responsive>
  )
}

const Background = styled(Box)<{
  headerImageUrl: string
  height: number
}>`
  position: relative;
  background: ${color("black30")};
  height: ${props => props.height}px;
  background-image: url(${props => props.headerImageUrl});
  background-size: cover;
  background-position: center;

  ${media.xs`
    margin-left: -20px;
    margin-right: -20px;
  `};
`
export const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.15) 0%,
    rgba(0, 0, 0, 0.25) 95%
  );
  z-index: 0;
`

const MetaContainer = styled(Box)`
  position: relative;
  z-index: 1;
`

const BreadcrumbContainer = styled(Sans)`
  a {
    text-decoration: none;
  }
`

const EntityContainer = styled(Box)<{
  isColumnLayout: boolean
}>`
  ${props => (props.isColumnLayout ? "" : "min-width: 200px;")}
`

const ImageCaption = styled(Box)<{
  size: string
}>`
  ${unica("s12")};
  position: absolute;
  bottom: 5px;
  ${props => {
    if (["xs", "sm", "md"].includes(props.size)) {
      return `
        left: 20px;
      `
    } else {
      return `right: 20px;`
    }
  }}
  max-width: ${props => (props.size === "xs" ? "300px" : "100%")};
  color: ${color("white100")};
  z-index: 7;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.25);
`

const ExtendedSerif = styled(Serif)`
  div span {
    span p {
      display: inline;
    }

    div p {
      display: inline;
      ${unica("s12")};
    }
  }
`

const ViewMore = styled(Box)`
  div {
    div {
      text-decoration: underline;
      ${unica("s14")};
    }

    div:first-child {
      text-decoration: none;
    }
  }
`

export const CollectionFilterFragmentContainer = createFragmentContainer(
  CollectionHeader,
  {
    artworks: graphql`
      fragment Header_artworks on FilterArtworks {
        merchandisable_artists {
          id
          _id
          name
          imageUrl
          birthday
          nationality
          ...FollowArtistButton_artist
        }
      }
    `,
  }
)
