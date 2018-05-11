/* tslint:disable */

import { ConcreteFragment } from "relay-runtime"
export type GeneToolTip_gene = {
  readonly description: string | null
  readonly href: string | null
  readonly image:
    | ({
        readonly url: string | null
      })
    | null
  readonly name: string | null
}

const node: ConcreteFragment = {
  kind: "Fragment",
  name: "GeneToolTip_gene",
  type: "Gene",
  metadata: null,
  argumentDefinitions: [],
  selections: [
    {
      kind: "ScalarField",
      alias: null,
      name: "description",
      args: null,
      storageKey: null,
    },
    {
      kind: "ScalarField",
      alias: null,
      name: "href",
      args: null,
      storageKey: null,
    },
    {
      kind: "LinkedField",
      alias: null,
      name: "image",
      storageKey: null,
      args: null,
      concreteType: "Image",
      plural: false,
      selections: [
        {
          kind: "ScalarField",
          alias: null,
          name: "url",
          args: [
            {
              kind: "Literal",
              name: "version",
              value: "tall",
              type: "[String]",
            },
          ],
          storageKey: 'url(version:"tall")',
        },
      ],
    },
    {
      kind: "ScalarField",
      alias: null,
      name: "name",
      args: null,
      storageKey: null,
    },
    {
      kind: "ScalarField",
      alias: null,
      name: "__id",
      args: null,
      storageKey: null,
    },
  ],
}
;(node as any).hash = "cf83cd4c4e3570684b5da26ed12269fe"
export default node
