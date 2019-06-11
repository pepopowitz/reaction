import { Serif } from "@artsy/palette"
import { MockBoot } from "DevTools/MockBoot"
import { mount } from "enzyme"
import { DateTime, Settings } from "luxon"
import React from "react"
import {
  AuctionCard,
  LargeAuctionCard,
  relativeTime,
  SmallAuctionCard,
  upcomingLabel,
} from "../AuctionCard"

describe("AuctionCard", () => {
  const props = {
    src: "https://picsum.photos/200/180/?random",
    headline: "Sotheby’s",
    subHeadline: "Contemporary Day Sale",
    badge: "In progress",
    href: "#",
    isGalleryAuction: false,
    isBenefit: false,
  }

  const defaultZone = Settings.defaultZoneName

  beforeEach(() => {
    Settings.defaultZoneName = "America/New_York"
  })

  afterEach(() => {
    Settings.defaultZoneName = defaultZone
  })

  beforeAll(() => {
    window.matchMedia = undefined // Immediately set matching media query in Boot
  })

  it("is responsive", () => {
    const small = mount(
      <MockBoot breakpoint="xs">
        <AuctionCard {...props} />
      </MockBoot>
    )
    expect(small.find(SmallAuctionCard).length).toEqual(1)

    const large = mount(
      <MockBoot breakpoint="lg">
        <AuctionCard {...props} />
      </MockBoot>
    )
    expect(large.find(LargeAuctionCard).length).toEqual(1)
  })

  it("Renders blank space instead of subHeadline for gallery auctions", () => {
    props.isGalleryAuction = true
    const small = mount(
      <MockBoot breakpoint="xs">
        <AuctionCard {...props} />
      </MockBoot>
    )
    expect(small.find(Serif).length).toEqual(1)

    const large = mount(
      <MockBoot breakpoint="lg">
        <AuctionCard {...props} />
      </MockBoot>
    )
    expect(
      large
        .find(Serif)
        .at(1)
        .text()
    ).toEqual("\u00A0")
  })

  it("Renders blank space instead of subHeadline for benefit auctions", () => {
    props.isBenefit = true
    const small = mount(
      <MockBoot breakpoint="xs">
        <AuctionCard {...props} />
      </MockBoot>
    )
    expect(small.find(Serif).length).toEqual(1)

    const large = mount(
      <MockBoot breakpoint="lg">
        <AuctionCard {...props} />
      </MockBoot>
    )
    expect(
      large
        .find(Serif)
        .at(1)
        .text()
    ).toEqual("\u00A0")
  })

  const now = () => DateTime.fromISO("2019-04-16").setZone("America/New_York")

  describe("relativeTime", () => {
    it("formats properly when >= 1 day", () => {
      expect(
        relativeTime(now().plus({ hours: 25 }), now())
      ).toMatchInlineSnapshot(`"1d"`)
    })

    it("formats properly when >= 1 hours", () => {
      expect(
        relativeTime(now().plus({ minutes: 61 }), now())
      ).toMatchInlineSnapshot(`"1h"`)
    })

    it("formats properly when >= 1 minutes", () => {
      expect(
        relativeTime(now().plus({ seconds: 61 }), now())
      ).toMatchInlineSnapshot(`"1m"`)
    })

    it("formats properly otherwise", () => {
      expect(
        relativeTime(now().plus({ seconds: 1 }), now())
      ).toMatchInlineSnapshot(`"1s"`)
    })
  })

  describe("upcomingLabel", () => {
    it("handles preview sales", () => {
      expect(
        upcomingLabel(
          {
            is_preview: true,
            start_at: now().plus({ hours: 25 }),
          },
          now()
        )
      ).toMatchInlineSnapshot(`"Opens in 1d"`)
    })

    it("handles closed auctions", () => {
      expect(
        upcomingLabel({
          is_closed: true,
        })
      ).toMatchInlineSnapshot(`"Auction closed"`)
    })

    describe("LAI sales", () => {
      it("handles in-progress sales", () => {
        expect(
          upcomingLabel(
            {
              is_live_open: true,
              live_start_at: now().minus({ minutes: 1 }),
            },
            now()
          )
        ).toMatchInlineSnapshot(`"In progress"`)
      })

      it("handles upcoming sales", () => {
        expect(
          upcomingLabel(
            {
              live_start_at: now().plus({ days: 1 }),
            },
            now()
          )
        ).toMatchInlineSnapshot(`"Register by Apr 17"`)
      })

      it("handles upcoming sales with closed registration", () => {
        expect(
          upcomingLabel(
            {
              is_registration_closed: true,
              live_start_at: now().plus({ days: 1 }),
            },
            now()
          )
        ).toMatchInlineSnapshot(`"Live in 1d"`)
      })

      it("handles upcoming sales the user is registered for", () => {
        expect(
          upcomingLabel(
            {
              registration_status: {},
              live_start_at: now().plus({ days: 1 }),
            },
            now()
          )
        ).toMatchInlineSnapshot(`"Live in 1d"`)
      })
    })
  })
})
