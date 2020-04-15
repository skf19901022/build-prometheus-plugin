package io.jenkins.plugins.collector.handler;

import com.google.inject.Inject;
import com.google.inject.name.Named;
import hudson.model.Result;
import hudson.model.Run;
import io.jenkins.plugins.collector.util.BuildUtil;
import io.prometheus.client.Gauge;
import io.prometheus.client.SimpleCollector;
import java.util.List;
import java.util.Optional;
import java.util.function.Consumer;
import java.util.function.Function;
import javax.annotation.Nonnull;

import static io.jenkins.plugins.collector.util.BuildUtil.getBuildEndTime;
import static io.jenkins.plugins.collector.util.BuildUtil.getLabels;
import static io.jenkins.plugins.collector.util.BuildUtil.isAbortBuild;
import static io.jenkins.plugins.collector.util.BuildUtil.isCompleteOvertime;
import static java.util.Collections.singletonList;

public class LeadTimeHandler implements Function<Run, List<SimpleCollector>> {

  private Gauge leadTimeMetrics;

  @Inject
  public LeadTimeHandler(@Named("leadTimeGauge") Gauge leadTimeMetrics) {
    this.leadTimeMetrics = leadTimeMetrics;
  }

  @Override
  public List<SimpleCollector> apply(@Nonnull Run successBuild) {
    Optional.of(successBuild)
        .filter(BuildUtil::isFirstSuccessfulBuildAfterError)
        .map(firstSuccessBuild -> calculateLeadTime(firstSuccessBuild.getPreviousBuild(), firstSuccessBuild))
        .ifPresent(setLeadTimeThenPush(getLabels(successBuild)));
    return singletonList(leadTimeMetrics);
  }

  private Consumer<Long> setLeadTimeThenPush(String... labels) {
    return leadTime -> this.leadTimeMetrics.labels(labels).set(leadTime);
  }

  private Long calculateLeadTime(Run matchedBuild, Run successBuild) {
    long leadTime = successBuild.getDuration();
    while (!isASuccessAndFinishedMatchedBuild(matchedBuild, successBuild)) {
      if (!isAbortBuild(matchedBuild)) {
        leadTime = Math.max(leadTime, getBuildEndTime(successBuild) - matchedBuild.getStartTimeInMillis());
      }
      matchedBuild = matchedBuild.getPreviousBuild();
    }
    return leadTime;
  }

  private boolean isASuccessAndFinishedMatchedBuild(Run matchedBuild, Run currentBuild) {
    return matchedBuild == null
        || (!isCompleteOvertime(matchedBuild, currentBuild) && Result.UNSTABLE.isWorseOrEqualTo(matchedBuild.getResult()));
  }
}
