import { checkMatchesReturnMatcher } from '../common/check.ts';
import { Mqtt } from '../common/mqtt/mqtt.ts';
import { MqttClient } from '../common/mqtt/mqtt_client.ts';
import { DISCONNECT } from '../common/mqtt/mqtt_messages.ts';
import { denoflareCliCommand } from './cli_common.ts';
import { commandOptionsForPubsub, parsePubsubOptions } from './cli_pubsub.ts';

export const PUBLISH_COMMAND = denoflareCliCommand(['pubsub', 'publish'], 'Publish a message to a Pub/Sub broker')
    .option('text', 'string', 'Plaintext message payload')
    .option('file', 'string', 'Path to file with the message payload')
    .option('topic', 'required-string', 'Topic on which to publish the message')
    .option('n', 'integer', 'Times to repeat the message')
    .option('maxMessagesPerSecond', 'integer', 'Maximum rate of message to send per second')
    .include(commandOptionsForPubsub())
    .docsLink('/cli/pubsub#publish')
    ;

export async function publish(args: (string | number)[], options: Record<string, unknown>) {
    if (PUBLISH_COMMAND.dumpHelp(args, options)) return;

    const { verbose, text, file, topic, n, maxMessagesPerSecond = 10 } = PUBLISH_COMMAND.parse(args, options); // 10 = current beta limit: https://developers.cloudflare.com/pub-sub/platform/limits/

    if ((text ?? file) === undefined) throw new Error(`Specify a payload with --text or --file`);
    const basePayload = text ? text : await Deno.readFile(file!);

    if (verbose) {
        Mqtt.DEBUG = true;
    }

    const { endpoint, clientId, password, debug } = parsePubsubOptions(options);

    const [ _, protocol, brokerName, namespaceName, portStr] = checkMatchesReturnMatcher('endpoint', endpoint, /^(mqtts|wss):\/\/(.*?)\.(.*?)\.cloudflarepubsub\.com:(\d+)$/);

    const hostname = `${brokerName}.${namespaceName}.cloudflarepubsub.com`;
    const port = parseInt(portStr);
    if (protocol !== 'mqtts' && protocol !== 'wss') throw new Error(`Unsupported protocol: ${protocol}`);

    const client = new MqttClient({ hostname, port, protocol, maxMessagesPerSecond }); 
    client.onMqttMessage = message => {
        if (debug) console.log(JSON.stringify(message, undefined, 2));
        if (message.type === DISCONNECT) {
            console.log('disconnect', message.reason);
        }
    };

    console.log('connecting');
    await client.connect({ clientId, password });

    for (let i = 0; i < (n ?? 1); i++) {
        console.log(`publishing${n ? ` ${i + 1} of ${n}` : ''}`);
        let payload = basePayload;
        if (n !== undefined && typeof payload === 'string' && payload.includes('$n')) {
            payload = payload.replace('$n', String(i + 1));
        }
        await client.publish({ topic, payload });
    }

    console.log('disconnecting');
    await client.disconnect();

    console.log('disconnected');
}
