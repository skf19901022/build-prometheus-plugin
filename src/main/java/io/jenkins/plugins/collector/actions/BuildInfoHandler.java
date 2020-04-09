package io.jenkins.plugins.collector.actions;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import hudson.model.Run;
import io.prometheus.client.Gauge;
import java.util.function.Consumer;
import javax.annotation.Nonnull;

import static io.jenkins.plugins.collector.util.BuildUtil.getLabels;

public class BuildInfoHandler implements Consumer<Run> {

  private Gauge buildDurationMetrics;
  private Gauge buildStartTimeMetrics;

  @Inject
  public BuildInfoHandler(@Named("durationGauge") Gauge buildDurationMetrics,
                          @Named("startTimeGauge") Gauge buildStartTimeMetrics) {
    this.buildDurationMetrics = buildDurationMetrics;
    this.buildStartTimeMetrics = buildStartTimeMetrics;
  }

  @Override
  public void accept(@Nonnull Run build) {
    buildDurationMetrics.labels(getLabels(build)).set(build.getDuration());
    buildStartTimeMetrics.labels(getLabels(build)).set(build.getStartTimeInMillis());
  }

}
