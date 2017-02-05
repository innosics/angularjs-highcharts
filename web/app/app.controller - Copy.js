(function() {
    'use strict';

    angular.module('appModule').controller('appCtrl', appCtrl);

    appCtrl.$inject = ['$scope', 'appService'];

    function appCtrl($scope, appService) {

        $scope.title = "Angular1 Highcharts";

        // highcharts
        let chart;
        let vBar;

        $scope.channels = {
            211: ['rgba( 44,187,175,1)', 'rgba( 44,187,175,0.25)', 'rgba( 44,187,175,0)', true],
            212: ['rgba( 47,175,219,1)', 'rgba( 47,175,219,0.25)', 'rgba( 47,175,219,0)',true],
            213: ['rgba( 84,132,196,1)', 'rgba( 84,132,196,0.25)', 'rgba( 84,132,196,0)', true],
            214: ['rgba(214,111,171,1)', 'rgba(214,111,171,0.25)', 'rgba(214,111,171,0)', true],
            215: ['rgba(141,122,184,1)', 'rgba(141,122,184,0.25)', 'rgba(141,122,184,0)', true],
            216: ['rgba(233,130, 62,1)', 'rgba(233,130, 62,0.25)', 'rgba(233,130, 62,0)', true]
        };

        Highcharts.setOptions({
            global: {
                useUTC: false,
                getTimezoneOffset: function (timestamp) {
                    var zone = new Date().getTimezoneOffset(),
                        timezoneOffset = -moment.tz(timestamp, zone).utcOffset();

                    return timezoneOffset;
                }
            }
        });

        chart = Highcharts.chart('container', {

            chart: {
                events: {
                    load: function() {
                        let chartInstance = this;

                        appService.getData()
                            .subscribe(msg => {
                                if(Array.isArray(msg)){
                                    //console.log("msg");
                                    if(msg.length === Object.keys($scope.channels).length) {
                                        msg.forEach(function(oneSplineData, i) {

                                            let p = {
                                                x: oneSplineData.x,
                                                y: oneSplineData.y
                                            };

                                            let shift = false;
                                            if (chart.series[i].data.length < 100) {
                                                chartInstance.showLoading('The Chart is loading ' + chart.series[i].data.length + '%');
                                            } else {
                                                shift = true;
                                                chartInstance.hideLoading();
                                            }
                                            //add marker
                                            let l = chart.series[i].data.length;
                                            if ( l > 0 ) {
                                                let preP = {
                                                    x: chart.series[i].data[l -1].x,
                                                    y: chart.series[i].data[l -1].y
                                                };
                                                chart.series[i].data[l -1].remove(false);
                                                chart.series[i].addPoint(preP, false, false);
                                            }
                                                p.marker = {
                                                    enabled: true,
                                                    symbol: 'circle',
                                                    radius: 10,
                                                };
                                            chart.series[i].addPoint(p, false, shift);
                                        });

                                        chartInstance.redraw();
                                    }
                                }
                            })
                    }
                },
                marginRight: 50,
                marginTop: 10
            }, //chart is over.

            title: {
                text: ''
            },
            xAxis: {
                type: 'datetime',
                gridLineColor: '#fff',
                gridLineWidth: 10,
                gridZIndex: 2,
                minPadding: 0,
                maxPadding: 0,
                tickLength: 0,
                lineWidth: 0,
                offset: 2,
                lineColor: '#333',
                tickInterval: 15 * 1000,
            },
            yAxis: {
                min: 0,
                max: 100,
                floor: 0,
                ceiling: 100,
                gridLineColor: '#333',
                gridLineWidth: 2,
                minorGridLineColor: '#333',
                minorGridLineWidth: 1,
                minorTickLength: 0,
                minorTickInterval: 5,
                tickInterval: 20,
                gridZIndex: 1,
                title: {text: ''},
            },
            legend: {
                enabled: false
            },
            credits:{
                enabled:false
            },
            plotOptions: {
                series: {
                    shadow:false,
                    marker:{
                        enabled:false
                    }
                }
            },
            series: (function () {
                let splines = [];

                for(let k of Object.keys($scope.channels)) {
                    let oneSpline = {
                        type: 'spline',
                        id: k,
                        color: $scope.channels[k][0],
                        data: [],
                        events: {
                            hide: function() {
                            }
                        }
                    };
                    splines.push(oneSpline);
                }

                return splines;

            })(),
        });
        createVbar(chart.plotWidth + 48, 9, chart.plotHeight - 10);

        $scope.stateChange = function(id) {
            let channel = chart.get(id);
            if($scope.channels[id][3]) {
               channel.update({color: $scope.channels[id][0]});
            } else {
               channel.update({color: $scope.channels[id][2]});
            }
        }

        $scope.onMouseEnter = function(id) {
            if(! $scope.channels[id][3]) { return; }
            for(let k of Object.keys($scope.channels)) {
                if (k !== id) {
                    if($scope.channels[k][3]) {
                        let channel = chart.get(k);
                        channel.update({color: $scope.channels[k][1]});
                    }
                }
            }
        }

        $scope.onMouseLeave = function(id) {
            if(! $scope.channels[id][3]) { return; }
            for(let k of Object.keys($scope.channels)) {
                if (k !== id) {
                    if($scope.channels[k][3]) {
                        let channel = chart.get(k);
                        channel.update({color: $scope.channels[k][0]});
                    }
                }
            }
        }

        function createVbar(x1, y1, y2) {
            vBar = chart.renderer.path(['M', x1, y1, 'V', y2])
                .attr({
                    'stroke-width': 4,
                    stroke: '#444',
                    zIndex: 2
                }).add();
        }

        function handleResize() {
            console.log('handleResize...');
            chart.redraw();

            vBar.destroy();
            createVbar(chart.plotWidth + 48, 9, chart.plotHeight + 11);
        }

        window.addEventListener('resize', function() {
            if(this.resizeTO) clearTimeout(this.resizeTO);
            this.resizeTO = setTimeout(function() {
                this.resizeTO = setTimeout(function() {
                    handleResize();
                }, 100);
            });
        });

    } // end of controller

})();
