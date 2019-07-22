import { EntityHeader } from "@artsy/palette"
import { MockBoot } from "DevTools/MockBoot"
import { mount, shallow } from "enzyme"
import React from "react"
import { CollectionHeader, getFeaturedArtists, Props } from "../index"

describe("collections header", () => {
  let props: Props
  beforeEach(() => {
    props = {
      artworks: {
        " $refType": null,
        merchandisable_artists: [
          {
            id: "kaws",
            _id: "4e934002e340fa0001005336",
            name: "KAWS",
            imageUrl:
              "https://d32dm0rphc51dk.cloudfront.net/WhacjFyMKlMkNVzncPjlRA/square.jpg",
            birthday: "1974",
            nationality: "American",
            " $fragmentRefs": null,
          },
          {
            id: "robert-lazzarini",
            _id: "4f5f64c23b555230ac0003ae",
            name: "Robert Lazzarini",
            imageUrl:
              "https://d32dm0rphc51dk.cloudfront.net/1npk1i_Xua5q8Hv0YOq_3g/square.jpg",
            birthday: "1965",
            nationality: "American",
            " $fragmentRefs": null,
          },
          {
            id: "medicom",
            _id: "58fe85ee275b2450a0fd2b51",
            name: "Medicom",
            imageUrl:
              "https://d32dm0rphc51dk.cloudfront.net/jUMOidRmCQ0RyynXM_sFzQ/square.jpg",
            birthday: "",
            nationality: "",
            " $fragmentRefs": null,
          },
          {
            id: "medicom-toy-slash-china",
            _id: "5b9821af86c8aa21d364dde5",
            name: "Medicom Toy/China",
            imageUrl:
              "https://d32dm0rphc51dk.cloudfront.net/npEmyaOeaPzkfEHX5VsmQg/square.jpg",
            birthday: "",
            nationality: "",
            " $fragmentRefs": null,
          },
        ],
      },
      collection: {
        title: "KAWS: Toys",
        category: "Collectible Sculptures",
        slug: "kaws-toys",
        headerImage:
          "https://d32dm0rphc51dk.cloudfront.net/WhacjFyMKlMkNVzncPjlRA/square.jpg",
        query: {
          gene_id: null,
          artist_id: null,
          artist_ids: ["4e934002e340fa0001005336"],
        },
      },
    }
  })

  function mountComponent(theProps: Props, breakpoint: "sm" | "lg" = "sm") {
    return mount(
      <MockBoot breakpoint={breakpoint}>
        <CollectionHeader {...theProps} />
      </MockBoot>
    )
  }

  describe("getFeaturedArtists", () => {
    const mockMediator = jest.fn()

    it("returns the queried artists when there is explicit artist_ids", () => {
      const { collection, artworks } = props
      const results = getFeaturedArtists(
        9,
        collection,
        true,
        artworks.merchandisable_artists,
        mockMediator,
        {}
      )

      expect(results.length).toEqual(1)
    })

    it("passes correct arguments featuredArtistsEntityCollection", () => {
      const { collection, artworks } = props

      const wrapper = shallow(
        <div>
          {getFeaturedArtists(
            9,
            collection,
            true,
            artworks.merchandisable_artists,
            mockMediator,
            {}
          )}
        </div>
      )

      const entities = wrapper.find(EntityHeader)
      expect(entities.length).toBe(1)

      const artist = entities.at(0).props().FollowButton.props.artist
      expect(artist).toMatchObject({
        id: "kaws",
        _id: "4e934002e340fa0001005336",
        name: "KAWS",
        imageUrl:
          "https://d32dm0rphc51dk.cloudfront.net/WhacjFyMKlMkNVzncPjlRA/square.jpg",
        birthday: "1974",
        nationality: "American",
      })
    })
  })

  describe("collection meta data", () => {
    it("renders the title", () => {
      props.collection.title = "Scooby Doo"

      const component = mountComponent(props)

      expect(component.text()).toContain("Scooby Doo")
    })

    it("renders breadcrumb category", () => {
      props.collection.category = "Nachos"

      const component = mountComponent(props)

      expect(component.text()).toContain("All works")
      expect(component.text()).toContain("Nachos")
    })

    describe("description", () => {
      describe("smaller screen", () => {
        it("renders truncated description if description exists", () => {
          props.collection.description = "some description"

          const component = mountComponent(props)

          const readMore = component.find("ReadMore")
          expect(readMore.length).toEqual(1)
          expect(readMore.text()).toContain("some description")
        })

        it("renders truncation with no text if description does not exist", () => {
          props.collection.description = undefined

          const component = mountComponent(props)

          const readMore = component.find("ReadMore")
          expect(readMore.length).toEqual(1)
          expect(readMore.text()).toEqual("")
        })
      })

      describe("larger screen", () => {
        it("renders description untruncated if description exists", () => {
          props.collection.description = "some description"

          const component = mountComponent(props, "lg")

          expect(component.find("ReadMore").length).toEqual(0)
          expect(component.text()).toContain("some description")
        })
      })

      it("renders a formatted string description", () => {
        props.collection.description = "<i>your description</i>"

        const component = mountComponent(props)

        expect(component.html()).toContain("<i>your description</i>")
      })
    })
  })

  describe("collection header featured artists rail", () => {
    it("renders featured artists when featured artists exist", () => {
      props.collection.query = {
        gene_id: null,
        artist_id: null,
        artist_ids: [],
      }
      const component = mountComponent(props, "lg")
      const entityHeaders = component.find(EntityHeader)

      expect(component.text()).toContain("Featured Artists")
      expect(entityHeaders.length).toEqual(4)
    })

    it("does not render featured artists when they don't exist", () => {
      props.artworks = {
        " $refType": null,
        merchandisable_artists: [],
      }
      const component = mountComponent(props, "lg")
      const entities = component.find(EntityHeader)

      expect(component.text()).not.toContain("Featured Artists")
      expect(entities.length).toEqual(0)
    })
  })
})
