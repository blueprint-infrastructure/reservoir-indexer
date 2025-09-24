export const config = {
  version: String(process.env.VERSION),
  port: Number(process.env.PORT),
  chainId: Number(process.env.CHAIN_ID),
  chainName: String(process.env.CHAIN_NAME || "unknown"),
  environment: String(process.env.ENVIRONMENT),

  adminApiKey: String(process.env.ADMIN_API_KEY),
  bullmqAdminPassword: String(process.env.BULLMQ_ADMIN_PASSWORD),
  oraclePrivateKey: String(process.env.ORACLE_PRIVATE_KEY),
  oracleAwsKmsKeyId: String(process.env.ORACLE_AWS_KMS_KEY_ID),
  oracleAwsKmsKeyRegion: String(process.env.ORACLE_AWS_KMS_KEY_REGION),

  baseNetworkHttpUrl: String(process.env.BASE_NETWORK_HTTP_URL),
  baseNetworkWsUrl: String(process.env.BASE_NETWORK_WS_URL),
  baseNetworkMetadataIndexingUrl: String(
    process.env.BASE_NETWORK_METADATA_INDEXING_URL || process.env.BASE_NETWORK_HTTP_URL
  ),
  baseNetworkArchiveUrl: String(
    process.env.BASE_NETWORK_ARCHIVE_URL || process.env.BASE_NETWORK_HTTP_URL
  ),
  baseNetworkBackfillUrl: String(
    process.env.BASE_NETWORK_BACKFILL_URL || process.env.BASE_NETWORK_HTTP_URL
  ),

  openseaChainName: process.env.OPENSEA_CHAIN_NAME,

  // When running in liquidity-only mode, all metadata processes are disabled
  ordinalsMetadataUrl: String(process.env.ORDINALS_METADATA_URL || ""),
  liquidityOnly: Boolean(Number(process.env.LIQUIDITY_ONLY)),
  metadataIndexingMethod: String(process.env.METADATA_INDEXING_METHOD || "onchain"),
  metadataMaxFieldSizeMB: Number(process.env.METADATA_MAX_FIELD_SIZE_MB || 1),
  fallbackMetadataIndexingMethod: process.env.FALLBACK_METADATA_INDEXING_METHOD || undefined,
  metadataIndexingMethodCollection: String(
    process.env.METADATA_INDEXING_METHOD_COLLECTION ||
      process.env.METADATA_INDEXING_METHOD ||
      "opensea"
  ),
  disableFlagStatusRefreshJob: Boolean(Number(process.env.DISABLE_FLAG_STATUS_REFRESH_JOB)),
  disableRealtimeMetadataRefresh: Boolean(Number(process.env.DISABLE_REALTIME_METADATA_REFRESH)),

  databaseUrl: String(process.env.DATABASE_URL),
  disableDatabaseStatementTimeout: Boolean(Number(process.env.DATABASE_DISABLE_STATEMENT_TIMEOUT)),
  readReplicaDatabaseUrl: String(process.env.READ_REPLICA_DATABASE_URL || ""),
  writeReplicaDatabaseUrl: String(
    process.env.WRITE_REPLICA_DATABASE_URL || process.env.DATABASE_URL
  ),
  redisUrl: String(process.env.REDIS_URL),
  rateLimitRedisUrl: String(process.env.RATE_LIMIT_REDIS_URL || process.env.REDIS_URL),
  redisWebsocketUrl: String(process.env.REDIS_WEBSOCKET_URL || process.env.REDIS_URL),
  metricsRedisUrl: String(process.env.METRICS_REDIS_URL || process.env.REDIS_URL),
  allChainsSyncRedisUrl: String(process.env.ALL_CHAINS_SYNC_REDIS_URL || process.env.REDIS_URL),

  master: Boolean(Number(process.env.MASTER)),
  catchup: Boolean(Number(process.env.CATCHUP)),
  doBackgroundWork: Boolean(Number(process.env.DO_BACKGROUND_WORK)),
  doWebsocketWork: Boolean(Number(process.env.DO_WEBSOCKET_WORK)),
  doWebsocketServerWork: Boolean(Number(process.env.DO_WEBSOCKET_SERVER_WORK)),
  doEventsSyncBackfill: Boolean(Number(process.env.DO_EVENTS_SYNC_BACKFILL)),
  disableOrders: Boolean(Number(process.env.DISABLE_ORDERS)),

  // For kafka
  doKafkaWork: Boolean(Number(process.env.DO_KAFKA_WORK)),
  kafkaPartitionsConsumedConcurrently: Number(process.env.KAFKA_PARTITIONS_CONSUMED_CONCURRENTLY),
  kafkaConsumerGroupId: String(process.env.KAFKA_CONSUMER_GROUP_ID),
  kafkaBrokers: process.env.KAFKA_BROKERS ? String(process.env.KAFKA_BROKERS).split(",") : [],
  kafkaClientId: String(process.env.KAFKA_CLIENT_ID),
  kafkaMaxBytesPerPartition: Number(process.env.KAFKA_MAX_BYTES_PER_PARTITION),

  // Uniswap Subgraph (either API KEY + GRAPH ID or just URL)
  uniswapSubgraphV3ApiKey: process.env.UNISWAP_SUBGRAPH_V3_API_KEY
    ? String(process.env.UNISWAP_SUBGRAPH_V3_API_KEY)
    : undefined,
  uniswapSubgraphV3Id: process.env.UNISWAP_SUBGRAPH_V3_ID
    ? String(process.env.UNISWAP_SUBGRAPH_V3_ID)
    : undefined,
  uniswapSubgraphV3Url: process.env.UNISWAP_SUBGRAPH_V3_URL
    ? String(process.env.UNISWAP_SUBGRAPH_V3_URL)
    : undefined,

  // V2
  uniswapSubgraphV2ApiKey: process.env.UNISWAP_SUBGRAPH_V2_API_KEY
    ? String(process.env.UNISWAP_SUBGRAPH_V2_API_KEY)
    : undefined,
  uniswapSubgraphV2Id: process.env.UNISWAP_SUBGRAPH_V2_ID
    ? String(process.env.UNISWAP_SUBGRAPH_V2_ID)
    : undefined,
  uniswapSubgraphV2Url: process.env.UNISWAP_SUBGRAPH_V2_URL
    ? String(process.env.UNISWAP_SUBGRAPH_V2_URL)
    : undefined,

  doKafkaStreamWork: Boolean(Number(process.env.DO_KAFKA_STREAM_WORK)),
  kafkaStreamClientId: String(process.env.KAFKA_STREAM_CLIENT_ID),
  kafkaStreamBrokers: process.env.KAFKA_STREAM_BROKERS
    ? String(process.env.KAFKA_STREAM_BROKERS).split(",")
    : [],
  kafkaStreamCertificateCa: String(process.env.KAFKA_STREAM_CERTIFICATE_CA),
  kafkaStreamCertificateKey: String(process.env.KAFKA_STREAM_CERTIFICATE_KEY),
  kafkaStreamCertificateCert: String(process.env.KAFKA_STREAM_CERTIFICATE_CERT),

  maxTokenSetSize: 100000,

  awsAccessKeyId: String(process.env.AWS_ACCESS_KEY_ID || process.env.FC_AWS_ACCESS_KEY_ID),
  awsSecretAccessKey: String(
    process.env.AWS_SECRET_ACCESS_KEY || process.env.FC_AWS_SECRET_ACCESS_KEY
  ),

  // For forwarding orders to OpenSea
  forwardOpenseaApiKey: String(process.env.FORWARD_OPENSEA_API_KEY),
  forwardReservoirApiKeys: process.env.FORWARD_RESERVOIR_API_KEYS
    ? (JSON.parse(process.env.FORWARD_RESERVOIR_API_KEYS) as string[])
    : [],

  alchemyApiKey: String(process.env.ALCHEMY_API_KEY),
  alchemyMetadataApiKey: String(process.env.ALCHEMY_METADATA_API_KEY),
  looksRareApiKey: String(process.env.LOOKSRARE_API_KEY),
  openSeaApiKey: String(process.env.OPENSEA_API_KEY),
  openSeaNftApiKey: String(process.env.OPENSEA_NFT_API_KEY),
  openSeaApiUrl: String(process.env.OPENSEA_API_URL || ""),

  // Block from which to sync and ignore any previous blocks
  genesisBlock: Number(process.env.GENESIS_BLOCK || 0),

  // Cosigner
  cosignerPrivateKey: String(process.env.COSIGNER_PRIVATE_KEY),

  // Solvers
  crossChainSolverBaseUrl: process.env.CROSS_CHAIN_SOLVER_BASE_URL,

  // Custom taker (used for simulation)
  customTakerPrivateKey: process.env.CUSTOM_TAKER_PRIVATE_KEY,

  // Distributor (used for split fee distribute)
  paymentSplitDistributorPrivateKey: process.env.PAYMENT_SPLIT_DISTRIBUTOR_PRIVATE_KEY,

  openSeaTokenMetadataApiKey: String(
    process.env.OPENSEA_TOKENS_API_KEY || process.env.OPENSEA_API_KEY
  ),
  openSeaTokenMetadataBySlugApiKey: String(
    process.env.OPENSEA_SLUG_API_KEY ||
      process.env.OPENSEA_TOKENS_API_KEY ||
      process.env.OPENSEA_API_KEY
  ),
  openSeaCollectionMetadataApiKey: String(
    process.env.OPENSEA_COLLECTION_API_KEY ||
      process.env.OPENSEA_TOKENS_API_KEY ||
      process.env.OPENSEA_API_KEY
  ),
  openSeaTokenFlagStatusApiKey: String(
    process.env.OPENSEA_TOKEN_FLAG_STATUS_API_KEY ||
      process.env.OPENSEA_TOKENS_API_KEY ||
      process.env.OPENSEA_API_KEY
  ),

  openSeaCrossPostingApiKey: String(
    process.env.OPENSEA_CROSS_POSTING_API_KEY || process.env.OPENSEA_API_KEY
  ),

  bloxrouteAuth: String(process.env.BLOXROUTE_AUTH),

  ordinalsApiKey: String(process.env.ORDINALS_API_KEY),

  enableImageResizing: Boolean(Number(process.env.ENABLE_IMAGE_RESIZING)),
  privateImageResizingSigningKey: String(process.env.PRIVATE_IMAGE_RESIZING_SIGNING_KEY),
  imageResizingBaseUrl: String(process.env.IMAGE_RESIZING_BASE_URL),

  nftxApiKey: String(process.env.NFTX_API_KEY),
  zeroExApiKey: process.env.ZEROEX_API_KEY,
  x2y2ApiKey: String(process.env.X2Y2_API_KEY),
  cbApiKey: String(process.env.CB_API_KEY),
  orderFetcherApiKey: String(process.env.ORDER_FETCHER_API_KEY),

  blurWsApiKey: process.env.BLUR_WS_API_KEY,
  blurWsUrl: process.env.BLUR_WS_URL,

  orderFetcherBaseUrl: String(process.env.ORDER_FETCHER_BASE_URL),

  cipherSecret: String(process.env.CIPHER_SECRET),
  imageTag: String(process.env.IMAGE_TAG),

  maxParallelTokenRefreshJobs: Number(process.env.MAX_PARALLEL_TOKEN_REFRESH_JOBS || 1),
  maxParallelTokenCollectionSlugRefreshJobs: Number(
    process.env.MAX_PARALLEL_TOKEN_COLLECTION_SLUG_REFRESH_JOBS || 1
  ),

  enableDebug: Boolean(Number(process.env.ENABLE_DEBUG)),

  // Elasticsearch
  elasticsearchUrl: String(process.env.ELASTICSEARCH_URL || ""),
  elasticsearchUsername: String(process.env.ELASTICSEARCH_USERNAME || ""),
  elasticsearchPassword: String(process.env.ELASTICSEARCH_PASSWORD || ""),
  doElasticsearchWork: Boolean(Number(process.env.DO_ELASTICSEARCH_WORK)),
  enableElasticsearchAsks: Boolean(Number(process.env.ENABLE_ELASTICSEARCH_ASKS)),
  deleteExpiredBidsElasticsearch: Boolean(Number(process.env.DELETE_EXPIRED_BIDS_ELASTICSEARCH)),
  enableElasticsearchTokens: Boolean(Number(process.env.ENABLE_ELASTICSEARCH_TOKENS)),
  enableElasticsearchTokensSearch: Boolean(Number(process.env.ENABLE_ELASTICSEARCH_TOKENS_SEARCH)),
  enableElasticsearchFtActivities: Boolean(Number(process.env.ENABLE_ELASTICSEARCH_FT_ACTIVITIES)),

  elasticsearchActivitiesUrl: String(process.env.ELASTICSEARCH_ACTIVITIES_URL || ""),
  elasticsearchActivitiesUsername: String(process.env.ELASTICSEARCH_ACTIVITIES_USERNAME || ""),
  elasticsearchActivitiesPassword: String(process.env.ELASTICSEARCH_ACTIVITIES_PASSWORD || ""),
  elasticsearchActivitiesIndexName: String(process.env.ELASTICSEARCH_ACTIVITIES_INDEX_NAME || ""),

  elasticsearchAsksUrl: String(process.env.ELASTICSEARCH_ASKS_URL || ""),
  elasticsearchAsksUsername: String(process.env.ELASTICSEARCH_ASKS_USERNAME || ""),
  elasticsearchAsksPassword: String(process.env.ELASTICSEARCH_ASKS_PASSWORD || ""),
  elasticsearchAsksIndexName: String(process.env.ELASTICSEARCH_ASKS_INDEX_NAME || ""),

  elasticsearchCollectionsUrl: String(process.env.ELASTICSEARCH_COLLECTIONS_URL || ""),
  elasticsearchCollectionsUsername: String(process.env.ELASTICSEARCH_COLLECTIONS_USERNAME || ""),
  elasticsearchCollectionsPassword: String(process.env.ELASTICSEARCH_COLLECTIONS_PASSWORD || ""),
  elasticsearchCollectionsIndexName: String(process.env.ELASTICSEARCH_COLLECTIONS_INDEX_NAME || ""),

  elasticsearchTokensUrl: String(process.env.ELASTICSEARCH_TOKENS_URL || ""),
  elasticsearchTokensUsername: String(process.env.ELASTICSEARCH_TOKENS_USERNAME || ""),
  elasticsearchTokensPassword: String(process.env.ELASTICSEARCH_TOKENS_PASSWORD || ""),
  elasticsearchTokensIndexName: String(process.env.ELASTICSEARCH_TOKENS_INDEX_NAME || ""),

  elasticsearchCurrenciesUrl: String(process.env.ELASTICSEARCH_CURRENCIES_URL || ""),
  elasticsearchCurrenciesUsername: String(process.env.ELASTICSEARCH_CURRENCIES_USERNAME || ""),
  elasticsearchCurrenciesPassword: String(process.env.ELASTICSEARCH_CURRENCIES_PASSWORD || ""),
  elasticsearchCurrenciesIndexName: String(process.env.ELASTICSEARCH_CURRENCIES_INDEX_NAME || ""),
  enableElasticsearchCurrencies: Boolean(Number(process.env.ENABLE_ELASTICSEARCH_CURRENCIES)),

  // RabbitMq
  rabbitHostname: String(process.env.RABBIT_HOSTNAME),
  rabbitUsername: String(process.env.RABBIT_USERNAME),
  rabbitPassword: String(process.env.RABBIT_PASSWORD),
  rabbitHttpUrl: `http://${String(process.env.RABBIT_USERNAME)}:${String(
    process.env.RABBIT_PASSWORD
  )}@${String(process.env.RABBIT_HOSTNAME)}:15672`,

  // RabbitMQ legacy for switching to new cluster
  rabbitHostnameLegacy: process.env.RABBIT_HOSTNAME_LEGACY
    ? String(process.env.RABBIT_HOSTNAME_LEGACY)
    : undefined,

  // RabbitMQ backfill used for large chains backfill
  rabbitHostnameBackfill: process.env.RABBIT_HOSTNAME_BACKFILL
    ? String(process.env.RABBIT_HOSTNAME_BACKFILL)
    : undefined,
  rabbitUsernameBackfill: String(
    process.env.RABBIT_USERNAME_BACKFILL ?? process.env.RABBIT_USERNAME
  ),
  rabbitPasswordBackfill: String(
    process.env.RABBIT_PASSWORD_BACKFILL ?? process.env.RABBIT_PASSWORD
  ),
  rabbitHttpUrlBackfill: `http://${String(process.env.RABBIT_USERNAME_BACKFILL)}:${String(
    process.env.RABBIT_PASSWORD_BACKFILL
  )}@${String(process.env.RABBIT_HOSTNAME_BACKFILL)}:15672`,
  assertRabbitVhost: Boolean(Number(process.env.ASSERT_RABBIT_VHOST)),
  rabbitDisableQueuesConsuming: Boolean(Number(process.env.RABBIT_DISABLE_QUEUES_CONSUMING)),
  forceEnableRabbitJobsConsumer: Boolean(Number(process.env.FORCE_ENABLE_RABBIT_JOBS_CONSUMER)),

  coinGeckoWsApiKey: process.env.COINGECKO_API_KEY,
  coingeckoNetworkId: process.env.COINGECKO_NETWORK_ID,

  spamNames: process.env.SPAM_NAMES ? String(process.env.SPAM_NAMES).split(",") : [],

  thirdWebSecret: process.env.THIRD_WEB_SECRET ? String(process.env.THIRD_WEB_SECRET) : undefined,

  ipfsGatewayDomain: String(process.env.IPFS_GATEWAY_DOMAIN || ""),
  forceIpfsGateway: Boolean(Number(process.env.FORCE_IPFS_GATEWAY)),

  yugalabsMetadataApiUserAgent: String(process.env.YUGALABS_METADATA_API_USER_AGENT || ""),

  disabledDatadogPluginsTracing: process.env.DISABLED_DATADOG_PLUGINS_TRACING
    ? String(process.env.DISABLED_DATADOG_PLUGINS_TRACING).split(",")
    : "ioredis,amqplib,pg,fetch,kafkajs,elasticsearch,dns,net".split(","),

  debugMetadataIndexingCollections: process.env.DEBUG_METADATA_INDEXING_COLLECTIONS
    ? String(process.env.DEBUG_METADATA_INDEXING_COLLECTIONS).split(",")
    : [],

  disableSyncTraces: Boolean(Number(process.env.DISABLE_SYNC_TRACES)),
  enableBlockGapCheck: Boolean(Number(process.env.ENABLE_BLOCK_GAP_CHECK)),
  disableSameRecipientCheck: Boolean(Number(process.env.DISABLE_SAME_RECIPIENT_CHECK)),
  sameRecipientWhitelist: process.env.SAME_RECIPIENT_WHITELIST
    ? String(process.env.SAME_RECIPIENT_WHITELIST).split(",")
    : [],

  l1ChainId: Number(process.env.L1_CHAIN_ID),
  l1BaseNetworkHttpUrl: process.env.L1_BASE_NETWORK_HTTP_URL
    ? String(process.env.L1_BASE_NETWORK_HTTP_URL)
    : undefined,
  l1TokenAddress: process.env.L1_TOKEN_ADDRESS ? String(process.env.L1_TOKEN_ADDRESS) : undefined,
  canonicalBridge: process.env.CANONICAL_BRIDGE ? String(process.env.CANONICAL_BRIDGE) : undefined,

  nativeErc20Tracker: process.env.NATIVE_ERC20_TRACKER
    ? String(process.env.NATIVE_ERC20_TRACKER)
    : undefined,
  indexAllErc20: Boolean(Number(process.env.INDEX_ALL_ERC20 ?? 0)),
  nativePricingCurrency: String(
    process.env.NATIVE_PRICING_CURRENCY ?? "0x0000000000000000000000000000000000000000"
  ),
  isTestnet: Boolean(Number(process.env.IS_TESTNET ?? 0)),
  enableWebSocket: Boolean(Number(process.env.ENABLE_WEB_SOCKET ?? 1)),
  enableNoTransfersResync: Boolean(Number(process.env.ENABLE_NO_TRANSFERS_RESYNC ?? 0)),
  nativeCurrencyInfo: process.env.NATIVE_CURRENCY_INFO
    ? JSON.parse(process.env.NATIVE_CURRENCY_INFO)
    : {
        address: "0x0000000000000000000000000000000000000000",
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        metadata: `{"coingeckoCurrencyId": "ethereum", "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png"}`,
      },
  wNativeCurrencyInfo: process.env.WNATIVE_CURRENCY_INFO
    ? JSON.parse(process.env.WNATIVE_CURRENCY_INFO)
    : {
        name: "Wrapped Ether",
        symbol: "WETH",
        decimals: 18,
        metadata: `{"coingeckoCurrencyId": "weth", "image": "https://coin-images.coingecko.com/coins/images/2518/large/weth.png?1696503332"}`,
      },
  enableWebsocketHealthCheck: Boolean(Number(process.env.ENABLE_WEBSOCKET_HEALTH_CHECK ?? 1)),
  enableUpdateTopCurrencies: Boolean(Number(process.env.ENABLE_UPDATE_TOP_CURRENCIES ?? 0)),
  updateTopCurrenciesSchedule: process.env.UPDATE_TOP_CURRENCIES_SCHEDULE
    ? String(process.env.UPDATE_TOP_CURRENCIES_SCHEDULE)
    : undefined,
};
