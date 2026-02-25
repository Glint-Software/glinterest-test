// Experimental GraphQL schema — decided not to pursue this
export const typeDefs = `
  type User {
    id: ID!
    username: String!
    displayName: String!
    avatarUrl: String
    pins: [Pin!]!
    boards: [Board!]!
  }

  type Pin {
    id: ID!
    title: String!
    description: String
    imageUrl: String!
    user: User!
    likeCount: Int!
    tags: [String!]!
  }

  type Board {
    id: ID!
    title: String!
    description: String
    user: User!
    pins: [Pin!]!
  }

  type Query {
    pins(limit: Int, offset: Int): [Pin!]!
    pin(id: ID!): Pin
    boards: [Board!]!
    board(id: ID!): Board
    user(id: ID!): User
    search(query: String!): [Pin!]!
  }
`;
