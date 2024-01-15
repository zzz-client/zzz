export default Schema;
type Schema = {
  info: {
    _postman_id: string;
    name: string;
    schema: string;
    _exporter_id: string;
    _collection_link: string;
  };
  item: [
    {
      name: string;
      item: [
        {
          name: string;
          request: {
            method: string;
            header: [
              {
                key: string;
                value: string;
                description: string;
              },
            ];
            body: {
              mode: string;
              raw: string;
            };
            url: {
              raw: string;
              protocol: string;
              host: string[];
              path: string[];
              query: [
                {
                  key: string;
                  value: string;
                },
              ];
            };
            description: string;
          };
          response: [];
        },
      ];
    },
  ];
};
