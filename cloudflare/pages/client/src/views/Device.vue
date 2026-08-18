<template>
    <v-container>
        <v-responsive max-width="640" class="mx-auto">
            <div class="headline text--primary my-4">{{ $t('connectedDevices') }}</div>
            <template v-if="$root.websocket">
                {{ $t('devicesConnected', { count: displayDevices.length, desktop: desktopDeviceCount, mobile: mobileDeviceCount }) }}
                <v-divider class="my-2"></v-divider>
            </template>
            <template v-else>
                {{ $t('notConnectedToServer') }}
            </template>

            <v-list rounded two-line>
                <v-list-item-group color="primary">
                    <v-list-item v-for="item in displayDevices" :key="item.id">
                        <v-list-item-avatar tile>
                            <template v-if="deviceType(item) === 'desktop'">
                                <v-icon v-if="item.os.split(' ').shift() === 'Windows'">{{mdiMicrosoftWindows}}</v-icon>
                                <v-icon v-else-if="item.os.split(' ').shift() === 'Linux'">{{mdiLinux}}</v-icon>
                                <v-icon v-else-if="item.os.split(' ').shift() === 'macOS'">{{mdiApple}}</v-icon>
                                <v-icon v-else>{{mdiLaptop}}</v-icon>
                            </template>
                            <template v-else-if="deviceType(item) === 'mobile' || deviceType(item) === 'tablet'">
                                <v-icon v-if="item.os.split(' ').shift() === 'Android'">{{mdiAndroid}}</v-icon>
                                <v-icon v-else-if="item.os.split(' ').shift() === 'iOS'">{{mdiAppleIos}}</v-icon>
                                <v-icon v-else>{{mdiTabletCellphone}}</v-icon>
                            </template>
                            <v-icon v-else>{{mdiDevices}}</v-icon>
                        </v-list-item-avatar>
                        <v-list-item-content>
                            <v-list-item-title>{{ deviceLabel(item) }}</v-list-item-title>
                            <v-list-item-subtitle>{{item.os}} ({{item.browser}})</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-responsive>
    </v-container>
</template>

<script>
import {
    mdiLaptop,
    mdiMicrosoftWindows,
    mdiApple,
    mdiLinux,
    mdiTabletCellphone,
    mdiAndroid,
    mdiAppleIos,
    mdiDevices,
} from '@mdi/js';

export default {
    data() {
        return {
            mdiLaptop,
            mdiMicrosoftWindows,
            mdiApple,
            mdiLinux,
            mdiTabletCellphone,
            mdiAndroid,
            mdiAppleIos,
            mdiDevices,
        };
    },
    computed: {
        displayDevices() {
            if (!this.$root.websocket) {
                return [];
            }
            return [this.currentDevice, ...this.$root.device];
        },
        currentDevice() {
            const ua = navigator.userAgent || '';
            const isTablet = /iPad|Tablet|PlayBook|Silk|Kindle/i.test(ua);
            const isMobile = !isTablet && /Mobile|iPhone|Android/i.test(ua);
            let os = 'Unknown';
            if (/Windows NT 10\.0/i.test(ua)) os = 'Windows 10';
            else if (/Android\s([\d.]+)/i.test(ua)) os = `Android ${RegExp.$1}`;
            else if (/iPhone OS\s([\d_]+)/i.test(ua)) os = `iOS ${RegExp.$1.replace(/_/g, '.')}`;
            else if (/iPad; CPU OS\s([\d_]+)/i.test(ua)) os = `iPadOS ${RegExp.$1.replace(/_/g, '.')}`;
            else if (/Mac OS X\s([\d_]+)/i.test(ua)) os = `macOS ${RegExp.$1.replace(/_/g, '.')}`;
            else if (/Linux/i.test(ua)) os = 'Linux';

            let browser = 'Unknown';
            if (/Edg\/(\d+)/i.test(ua)) browser = `Edge ${RegExp.$1}`;
            else if (/Chrome\/(\d+)/i.test(ua)) browser = `Chrome ${RegExp.$1}`;
            else if (/Firefox\/(\d+)/i.test(ua)) browser = `Firefox ${RegExp.$1}`;
            else if (/Version\/(\d+).+Safari/i.test(ua)) browser = `Safari ${RegExp.$1}`;

            return {
                id: '__current_device__',
                type: isTablet ? 'tablet' : (isMobile ? 'mobile' : 'desktop'),
                os,
                browser,
                isCurrent: true,
            };
        },
        desktopDeviceCount() {
            return this.displayDevices.filter(item => this.deviceType(item) === 'desktop').length;
        },
        mobileDeviceCount() {
            return this.displayDevices.filter(item => ['mobile', 'tablet'].includes(this.deviceType(item))).length;
        },
    },
    methods: {
        deviceType(item) {
            const type = String(item?.type || '').toLowerCase();
            return type === 'smartphone' ? 'mobile' : type;
        },
        deviceLabel(item) {
            const type = this.deviceType(item);
            const label = type === 'desktop'
                ? this.$t('desktopDevice')
                : (['mobile', 'tablet'].includes(type) ? this.$t('mobileDevice') : this.$t('otherDevice'));
            return item?.isCurrent ? `${label} (${this.$t('currentDevice')})` : label;
        },
    },
}
</script>
