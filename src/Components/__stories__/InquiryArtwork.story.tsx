import { storiesOf } from "@storybook/react"
import * as React from "react"
import * as Relay from "react-relay/classic"

import Artwork from "../InquiryArtwork"

import { artsyNetworkLayer } from "../../Relay/config"
import ArtworkQueryConfig from "../../Relay/Queries/Artwork"

function ArtworkExample(props: { artworkID: string }) {
  Relay.injectNetworkLayer(artsyNetworkLayer())
  return <Relay.RootContainer Component={Artwork} route={new ArtworkQueryConfig({ artworkID: props.artworkID })} />
}

storiesOf("Components/Inquiry Artwork", module)
  .add("A square artwork", () => <ArtworkExample artworkID="christopher-burkett-coastal-storm-oregon" />)
  .add("A landscape artwork", () => <ArtworkExample artworkID="andrew-moore-puente-de-bacunayagua-via-blanca" />)
  .add("A landscape artwork (extra wide)", () => <ArtworkExample artworkID="brian-kosoff-bay-of-islands" />)
  .add("A portrait artwork", () => (
    <ArtworkExample artworkID="damien-hirst-methylamine-13c-19?auction_id=heather-james-fine-art-curators-choice" />
  ))
  .add("A portrait artwork (extra tall)", () => <ArtworkExample artworkID="snik-untitled-vertical" />)
  .add("Artwork with two artists", () => (
    <ArtworkExample artworkID="/william-kentridge-self-portrait-as-a-coffee-pot-iii" />
  ))
