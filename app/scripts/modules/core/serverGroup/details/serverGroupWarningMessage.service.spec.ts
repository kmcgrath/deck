import {mock} from 'angular';
import {
  ServerGroupWarningMessageService,
  SERVER_GROUP_WARNING_MESSAGE_SERVICE
} from './serverGroupWarningMessage.service';
import {ApplicationModelBuilder, APPLICATION_MODEL_BUILDER} from 'core/application/applicationModel.builder';
import {ServerGroup} from 'core/domain/serverGroup';
import {Application} from 'core/application/application.model';
import {IConfirmationModalParams} from 'core/confirmationModal/confirmationModal.service';

describe('serverGroupWarningMessageService', () => {
  let service: ServerGroupWarningMessageService,
      applicationModelBuilder: ApplicationModelBuilder,
      app: Application,
      serverGroup: ServerGroup;

  beforeEach(mock.module(SERVER_GROUP_WARNING_MESSAGE_SERVICE, APPLICATION_MODEL_BUILDER));

  beforeEach(mock.inject((serverGroupWarningMessageService: ServerGroupWarningMessageService,
                          _applicationModelBuilder_: ApplicationModelBuilder) => {
    service = serverGroupWarningMessageService;
    applicationModelBuilder = _applicationModelBuilder_;
    app = applicationModelBuilder.createApplication();
  }));

  describe('addDestroyWarningMessage', () => {
    it('leaves parameters unchanged when additional server groups exist in cluster', () => {
      serverGroup = {
        account: 'test',
        cloudProvider: 'aws',
        cluster: 'foo',
        instanceCounts: { up: 0, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
        instances: [],
        name: 'foo-v000',
        region: 'us-east-1',
        type: 'a'
      };

        app.clusters = [
        {
          name: 'foo',
          account: 'test',
          serverGroups: [
            serverGroup,
            { account: 'test', cloudProvider: 'aws', cluster: 'foo', instanceCounts: { up: 0, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 }, instances: [], name: 'foo-v001', region: 'us-east-1', type: 'a' },
          ]
        }
      ];
      const params: IConfirmationModalParams = {};
      service.addDestroyWarningMessage(app, serverGroup, params);
      expect(params.body).toBeUndefined();
    });

    it('adds a body to the parameters with cluster name, region, account when this is the last server group', () => {
      serverGroup = {
        account: 'test',
        cloudProvider: 'aws',
        cluster: 'foo',
        instanceCounts: { up: 0, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
        instances: [],
        name: 'foo-v000',
        region: 'us-east-1',
        type: 'a'
      };

      app.clusters = [
        {
          name: 'foo',
          account: 'test',
          serverGroups: [serverGroup]
        }
      ];
      const params: IConfirmationModalParams = {};
      service.addDestroyWarningMessage(app, serverGroup, params);
      expect(params.body).toBeDefined();
      expect(params.body.includes('You are destroying the last Server Group in the Cluster')).toBe(true);
      expect(params.body.includes('test')).toBe(true);
      expect(params.body.includes('foo')).toBe(true);
      expect(params.body.includes('us-east-1')).toBe(true);
    });
  });

  describe('addDisableWarningMessage', () => {
    it('leaves parameters unchanged when server group has no instances', () => {
      serverGroup = {
        account: 'test',
        cloudProvider: 'aws',
        cluster: 'foo',
        instanceCounts: { up: 0, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
        instances: [],
        name: 'foo-v000',
        region: 'us-east-1',
        type: 'a'
      };

      app.clusters = [
        {
          name: 'foo',
          account: 'test',
          serverGroups: [serverGroup]
        }
      ];
      const params: IConfirmationModalParams = {};
      service.addDisableWarningMessage(app, serverGroup, params);
      expect(params.body).toBeUndefined();
    });

    it('adds remaining server groups to the body if they have up instances', () => {
      serverGroup = {
        account: 'test',
        cloudProvider: 'aws',
        cluster: 'foo',
        instanceCounts: { up: 1, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
        instances: [],
        name: 'foo-v000',
        region: 'us-east-1',
        type: 'a'
      };
      const omitted: ServerGroup = {
        account: 'test',
        cloudProvider: 'aws',
        cluster: 'foo',
        instanceCounts: { up: 0, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
        instances: [],
        name: 'foo-v001',
        region: 'us-east-1',
        type: 'a'
      };

      const included: ServerGroup = {
        account: 'test',
        cloudProvider: 'aws',
        cluster: 'foo',
        instanceCounts: { up: 1, down: 0, succeeded: 0, failed: 0, unknown: 0, outOfService: 0 },
        instances: [],
        name: 'foo-v002',
        region: 'us-east-1',
        type: 'a'
      };

      app.clusters = [
        {
          name: 'foo',
          account: 'test',
          serverGroups: [serverGroup, omitted, included]
        }
      ];
      const params: IConfirmationModalParams = {};
      service.addDisableWarningMessage(app, serverGroup, params);
      expect(params.body).toBeDefined();
      expect(params.body.includes('foo-v000')).toBe(false); // this is the target, so should not be included
      expect(params.body.includes('foo-v001')).toBe(false);
      expect(params.body.includes('foo-v002')).toBe(true);
    });
  });
});